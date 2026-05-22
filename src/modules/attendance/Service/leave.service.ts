import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Leave } from '../entities/leave.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';
import { Attendance } from '../entities/attendance.entity';
import { DataSource } from 'typeorm';
import { AttendanceStatus } from 'src/common/enums/AttendanceStatus.enum';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    private readonly dataSource: DataSource,
  ) {}

  // =====================
  // REQUEST LEAVE
  // =====================

  async requestLeave(employeeId: string, dto: CreateLeaveDto) {
    const today = dayjs().startOf('day');

    const startDate = dayjs(dto.startDate);

    const endDate = dayjs(dto.endDate);

    // FUTURE DATE ONLY
    if (startDate.isBefore(today)) {
      throw new BadRequestException(
        'Leave can only be requested for future dates',
      );
    }

    // START <= END
    if (startDate.isAfter(endDate)) {
      throw new BadRequestException(
        'Start date cannot be greater than end date',
      );
    }

    // OVERLAP CHECK
    const overlappingLeave = await this.leaveRepo
      .createQueryBuilder('leave')
      .where('leave.employee_id = :employeeId', {
        employeeId,
      })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatusEnum.PENDING, LeaveStatusEnum.APPROVED],
      })
      .andWhere(
        `
      (
        leave.start_date <= :endDate
        AND
        leave.end_date >= :startDate
      )
      `,
        {
          startDate: dto.startDate,

          endDate: dto.endDate,
        },
      )
      .getOne();

    if (overlappingLeave) {
      throw new BadRequestException('Leave already exists for selected dates');
    }

    const leave = this.leaveRepo.create({
      employeeId,

      type: dto.type,

      startDate: dto.startDate,

      endDate: dto.endDate,

      reason: dto.reason,

      status: LeaveStatusEnum.PENDING,
    });

    return this.leaveRepo.save(leave);
  }

  // =====================
  // MY LEAVES
  // =====================

  async getMyLeaves(employeeId: string, status?: string) {
    const qb = this.leaveRepo.createQueryBuilder('leave');

    qb.where('leave.employee_id = :employeeId', {
      employeeId,
    });

    if (status) {
      qb.andWhere('leave.status = :status', {
        status,
      });
    }

    qb.orderBy('leave.created_at', 'DESC');

    return qb.getMany();
  }

  // =====================
  // CANCEL LEAVE
  // =====================

  async cancelLeave(id: string, employeeId: string) {
    const leave = await this.leaveRepo.findOne({
      where: {
        id,
        employeeId,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    if (leave.status !== LeaveStatusEnum.PENDING) {
      throw new BadRequestException('Only pending leave can be cancelled');
    }

    leave.status = LeaveStatusEnum.CANCELLED;
    console.log({
      id,
      employeeId,
    });

    return this.leaveRepo.save(leave);
  }

  // =====================
  // HR ALL LEAVES
  // =====================

  async findAll(query: any) {
    const { status, employeeId, page = 1, limit = 10 } = query;

    const qb = this.leaveRepo.createQueryBuilder('leave');

    qb.leftJoinAndSelect('leave.employee', 'employee');

    qb.leftJoinAndSelect('leave.reviewer', 'reviewer');

    if (status) {
      qb.andWhere('leave.status = :status', {
        status,
      });
    }

    if (employeeId) {
      qb.andWhere('leave.employee_id = :employeeId', {
        employeeId,
      });
    }

    qb.orderBy('leave.created_at', 'DESC');

    qb.skip((Number(page) - 1) * Number(limit));

    qb.take(Number(limit));

    const [data, total] = await qb.getManyAndCount();

    return {
      data,

      meta: {
        total,

        page: Number(page),

        limit: Number(limit),

        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // =====================
  // APPROVE / REJECT
  // =====================

  async reviewLeave(
    id: string,

    status: LeaveStatusEnum,

    reviewerId: string,

    comment?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const leave = await manager.findOne(Leave, {
        where: {
          id,
        },
      });

      if (!leave) {
        throw new NotFoundException('Leave not found');
      }

      if (leave.status !== LeaveStatusEnum.PENDING) {
        throw new BadRequestException('Already reviewed');
      }

      leave.status = status;

      leave.reviewedById = reviewerId;

      leave.reviewComment = comment ?? null;

      leave.reviewedAt = new Date();

      await manager.save(leave);

      // ====================
      // APPROVED
      // CREATE ATTENDANCE
      // ====================

      if (status === LeaveStatusEnum.APPROVED) {
        let currentDate = dayjs(leave.startDate);

        const endDate = dayjs(leave.endDate);

        while (
          currentDate.isSame(endDate, 'day') ||
          currentDate.isBefore(endDate)
        ) {
          const date = currentDate.format('YYYY-MM-DD');

          // already attendance?
          const existingAttendance = await manager.findOne(Attendance, {
            where: {
              employeeId: leave.employeeId,

              date,
            },
          });

          if (!existingAttendance) {
            const attendance = manager.create(Attendance, {
              employeeId: leave.employeeId,

              date,

              status: AttendanceStatus.LEAVE,

              workedMinutes: 0,

              overtimeMinutes: 0,

              checkIn: null,

              checkOut: null,
            });

            await manager.save(attendance);
          }

          currentDate = currentDate.add(1, 'day');
        }
      }

      return leave;
    });
  }
}
