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
import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { LeaveBalanceService } from '../../leave-balance/leave-balance.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    private leaveBalanceService: LeaveBalanceService,

    private readonly dataSource: DataSource,
  ) {}

  async requestLeave(employeeId: string, dto: CreateLeaveDto) {
    const today = dayjs().startOf('day');

    const startDate = dayjs(dto.startDate);

    const endDate = dayjs(dto.endDate);

    if (startDate.isBefore(today)) {
      throw new BadRequestException(
        'Leave can only be requested for future dates',
      );
    }

    if (startDate.isAfter(endDate)) {
      throw new BadRequestException(
        'Start date cannot be greater than end date',
      );
    }

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

      if (status === LeaveStatusEnum.APPROVED) {
        // TOTAL DAYS
        const totalDays =
          dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;

        // DEDUCT BALANCE
        const deduction = await this.leaveBalanceService.deductLeave(
          leave.employeeId,

          totalDays,
        );

        const systemComment =
          `Paid Leave: ${deduction.paidLeaves}, ` +
          `Unpaid Leave: ${deduction.unpaidLeaves}, ` +
          `Remaining: ${deduction.remainingLeaves}`;

        leave.reviewComment = comment
          ? `${comment} | ${systemComment}`
          : systemComment;

        await this.createLeaveAttendance(leave);
      }

      if (status === LeaveStatusEnum.REJECTED) {
        leave.reviewComment = comment ?? null;
      }

      // FINAL UPDATE
      leave.status = status;

      leave.reviewedById = reviewerId;

      leave.reviewedAt = new Date();

      return manager.save(leave);
    });
  }

  private async createLeaveAttendance(leave: Leave) {
    const start = dayjs(leave.startDate);

    const end = dayjs(leave.endDate);

    for (
      let current = start;
      current.isBefore(end) || current.isSame(end, 'day');
      current = current.add(1, 'day')
    ) {
      const date = current.format('YYYY-MM-DD');

      const existing = await this.attendanceRepo.findOne({
        where: {
          employeeId: leave.employeeId,

          date,
        },
      });

      if (existing) {
        continue;
      }

      await this.attendanceRepo.save({
        employeeId: leave.employeeId,

        date,

        status: AttendanceStatus.LEAVE,

        workedMinutes: 0,

        overtimeMinutes: 0,
      });
    }
  }
}
