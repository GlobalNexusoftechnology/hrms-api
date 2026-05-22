import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { AttendanceCorrection } from './../entities/correction.entity';
import { Attendance } from './../entities/attendance.entity';
import { CorrectionRequestDto } from './../dto/correction-request.dto';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';
import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { formatIST } from '../../../utils/time.util';

dayjs.extend(isBetween);

@Injectable()
export class CorrectionService {
  constructor(
    @InjectRepository(AttendanceCorrection)
    private correctionRepo: Repository<AttendanceCorrection>,

    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    private dataSource: DataSource,
  ) {}

  async requestCorrection(employeeId: string, dto: CorrectionRequestDto) {
    // =====================
    // FIND ATTENDANCE
    // =====================

    const attendance = await this.attendanceRepo.findOne({
      where: {
        employeeId,

        date: dto.date,
      },
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    // =====================
    // DUPLICATE PENDING CHECK
    // =====================

    const existing = await this.correctionRepo.findOne({
      where: {
        employeeId,

        attendanceId: attendance.id,

        status: CorrectionStatus.PENDING,
      },
    });

    if (existing) {
      throw new BadRequestException('Correction already requested');
    }

    // =====================
    // VALIDATION
    // =====================

    const requestedCheckIn = dto.requestedCheckIn
      ? new Date(dto.requestedCheckIn)
      : null;

    const requestedCheckOut = dto.requestedCheckOut
      ? new Date(dto.requestedCheckOut)
      : null;

    const reason = dto.reason?.trim();

    // MUST CHANGE SOMETHING
    if (!requestedCheckIn && !requestedCheckOut) {
      throw new BadRequestException(
        'Please provide requested check-in or check-out time',
      );
    }

    // REASON REQUIRED
    if (!reason) {
      throw new BadRequestException('Reason is required');
    }

    // PREVENT SAME REQUEST
    const sameCheckIn =
      attendance.checkIn &&
      requestedCheckIn &&
      attendance.checkIn.getTime() === requestedCheckIn.getTime();

    const sameCheckOut =
      attendance.checkOut &&
      requestedCheckOut &&
      attendance.checkOut.getTime() === requestedCheckOut.getTime();

    if (sameCheckIn || sameCheckOut) {
      throw new BadRequestException(
        'Requested time is same as current attendance',
      );
    }

    // =====================
    // SAVE REQUEST
    // =====================

    const correction = this.correctionRepo.create({
      employeeId,

      attendanceId: attendance.id,

      // CURRENT VALUES
      currentCheckIn: attendance.checkIn,

      currentCheckOut: attendance.checkOut,

      // REQUESTED VALUES
      requestedCheckIn,

      requestedCheckOut,

      reason,

      status: CorrectionStatus.PENDING,
    });

    // return this.correctionRepo.save(correction);

    const saved = await this.correctionRepo.save(correction);

    return {
      ...saved,

      currentCheckIn: formatIST(saved.currentCheckIn),

      currentCheckOut: formatIST(saved.currentCheckOut),

      requestedCheckIn: formatIST(saved.requestedCheckIn),

      requestedCheckOut: formatIST(saved.requestedCheckOut),
    };
  }

  private calculateStatus(checkIn: Date): AttendanceStatus {
    const time = dayjs(checkIn);

    const presentEnd = time.startOf('day').hour(10).minute(0).second(0);

    const lateEnd = time.startOf('day').hour(12).minute(30).second(0);

    // BEFORE 11:00 AM
    if (time.isBefore(presentEnd)) {
      return AttendanceStatus.PRESENT;
    }

    // 10:00 AM - 12:30 PM
    if (time.isBefore(lateEnd)) {
      return AttendanceStatus.LATE;
    }

    // AFTER 12:30 PM
    return AttendanceStatus.HALF_DAY;
  }

  async review(id: string, status: CorrectionStatus, reviewerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const correction = await manager.findOne(AttendanceCorrection, {
        where: {
          id,
        },

        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!correction) {
        throw new BadRequestException('Correction not found');
      }

      if (correction.status !== CorrectionStatus.PENDING) {
        throw new BadRequestException('Already reviewed');
      }

      // =====================
      // REVIEW UPDATE
      // =====================

      correction.status = status;

      correction.reviewedById = reviewerId;

      correction.reviewedAt = new Date();

      let updatedAttendance: Attendance | null = null;

      // =====================
      // APPROVAL FLOW
      // =====================

      if (status === CorrectionStatus.APPROVED) {
        const attendance = await manager.findOne(Attendance, {
          where: {
            id: correction.attendanceId,
          },

          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!attendance) {
          throw new BadRequestException('Attendance not found');
        }

        // APPLY CORRECTIONS
        if (correction.requestedCheckIn) {
          attendance.checkIn = new Date(correction.requestedCheckIn);
        }

        if (correction.requestedCheckOut) {
          attendance.checkOut = new Date(correction.requestedCheckOut);
        }

        // INVALID TIME CHECK
        if (
          attendance.checkIn &&
          attendance.checkOut &&
          attendance.checkIn > attendance.checkOut
        ) {
          throw new BadRequestException('Invalid time range');
        }

        // RECALCULATE
        if (attendance.checkIn && attendance.checkOut) {
          const workedMinutes = Math.floor(
            (attendance.checkOut.getTime() - attendance.checkIn.getTime()) /
              60000,
          );

          attendance.workedMinutes = workedMinutes;

          attendance.overtimeMinutes =
            workedMinutes > 480 ? workedMinutes - 480 : 0;

          attendance.status = this.calculateStatus(attendance.checkIn);

          // EARLY CHECKOUT
          if (workedMinutes < 480) {
            attendance.earlyCheckoutReason = correction.reason;
          } else {
            attendance.earlyCheckoutReason = null;
          }
        }

        updatedAttendance = await manager.save(attendance, {
          reload: true,
        });
      }

      // SAVE CORRECTION
      await manager.save(correction);

      return {
        correction,

        attendance: updatedAttendance,
      };
    });
  }

  async findAll(query: any) {
    const {
      status,
      employeeId,

      page = 1,
      limit = 10,
    } = query;

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const qb = this.correctionRepo.createQueryBuilder('correction');

    // RELATIONS
    qb.leftJoinAndSelect('correction.employee', 'employee');

    qb.leftJoinAndSelect('correction.reviewer', 'reviewer');

    qb.leftJoinAndSelect('correction.attendance', 'attendance');

    // STATUS FILTER
    if (status) {
      qb.andWhere('correction.status = :status', {
        status,
      });
    }

    // EMPLOYEE FILTER
    if (employeeId) {
      qb.andWhere('correction.employee_id = :employeeId', {
        employeeId,
      });
    }

    qb.orderBy('correction.created_at', 'DESC');

    qb.skip((pageNumber - 1) * limitNumber);

    qb.take(limitNumber);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((correction) => ({
        id: correction.id,

        employee: correction.employee
          ? {
              id: correction.employee.id,

              employeeCode: correction.employee.employeeCode,

              name: `${correction.employee.firstName} ${correction.employee.lastName}`,
            }
          : null,

        attendanceId: correction.attendanceId,

        currentCheckIn: correction.currentCheckIn,

        currentCheckOut: correction.currentCheckOut,

        requestedCheckIn: correction.requestedCheckIn,

        requestedCheckOut: correction.requestedCheckOut,

        reason: correction.reason,

        status: correction.status,

        reviewedBy: correction.reviewer
          ? {
              id: correction.reviewer.id,

              name: `${correction.reviewer.firstName} ${correction.reviewer.lastName}`,
            }
          : null,

        reviewComment: correction.reviewComment,

        reviewedAt: correction.reviewedAt,

        createdAt: correction.createdAt,
      })),

      meta: {
        total,

        page: pageNumber,

        limit: limitNumber,

        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }
}
