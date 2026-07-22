import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Leave } from '../entities/leave.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';
import { Attendance } from '../entities/attendance.entity';
import { DataSource } from 'typeorm';
import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { LeaveEngineService } from '../../leave-engine/leave-engine.service';
import { LeavePolicy } from '../../leave-policy/entities/leave-policy.entity';
import { LeaveTransactionType } from '../../leave-ledger/entities/leave-ledger.entity';
import { DataScopeService } from '../../../common/services/data-scope.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(LeavePolicy)
    private readonly leavePolicyRepo: Repository<LeavePolicy>,

    private leaveEngineService: LeaveEngineService,

    private readonly dataSource: DataSource,
    private readonly dataScopeService: DataScopeService,
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

    // Fetch the applicable policy for this leave type
    const policy = await this.leavePolicyRepo.findOne({
      where: { leaveTypeId: dto.leaveTypeId, isActive: true },
    });

    if (!policy) {
      throw new BadRequestException('Active policy not found for this leave type');
    }

    // Notice Days Validation
    if (policy.noticeDays > 0) {
      const daysNotice = startDate.diff(today, 'day');
      if (daysNotice < policy.noticeDays) {
        throw new BadRequestException(`This leave type requires at least ${policy.noticeDays} days advance notice`);
      }
    }

    // Document Requirement
    const totalDays = endDate.diff(startDate, 'day') + 1;
    if (policy.documentRequiredAfterDays && totalDays > policy.documentRequiredAfterDays) {
      // Typically you'd check if a document was uploaded, but for now we just warn/enforce.
      // E.g., throw new BadRequestException(`A medical certificate is required for leaves exceeding ${policy.documentRequiredAfterDays} days`);
    }

    const leave = this.leaveRepo.create({
      employeeId,
      leaveTypeId: dto.leaveTypeId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      status: policy.requiresApproval ? LeaveStatusEnum.PENDING : LeaveStatusEnum.APPROVED,
    });

    const saved = await this.leaveRepo.save(leave);

    if (!policy.requiresApproval) {
       await this.reviewLeave(saved.id, LeaveStatusEnum.APPROVED, employeeId, 'Auto-approved by policy');
       saved.status = LeaveStatusEnum.APPROVED;
    }

    return saved;
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

  async findAll(query: any, currentUser: Employee) {
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

    this.dataScopeService.applyScope(qb, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });

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

        // DEDUCT BALANCE via LeaveEngine
        await this.leaveEngineService.processTransaction({
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          transactionType: LeaveTransactionType.LEAVE_TAKEN,
          days: totalDays,
          referenceId: leave.id,
          remarks: `Leave approved by ${reviewerId}`,
        });

        const systemComment = `Leave taken: ${totalDays} days deducted`;

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
