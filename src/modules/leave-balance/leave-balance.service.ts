import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";
import { DataScopeService } from '../../common/services/data-scope.service';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService
  ) {}

  async getEmployeeBalance(employeeId: string, year?: number, currentUser?: any) {
    const targetYear = year ?? new Date().getFullYear();
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const qb = this.leaveBalanceRepo.createQueryBuilder('balance')
      .leftJoinAndSelect('balance.leaveType', 'leaveType')
      .leftJoinAndSelect('balance.employee', 'employee')
      .where('balance.employeeId = :employeeId', { employeeId })
      .andWhere('balance.year = :targetYear', { targetYear })
      .andWhere('balance.tenantId = :tenantId', { tenantId });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
      });
    }

    const balances = await qb.getMany();

    return balances.map((b) => ({
      id: b.id,
      leaveType: b.leaveType,
      year: b.year,
      accrued: b.accrued,
      used: b.used,
      carriedForward: b.carriedForward,
      remaining: Number(b.accrued) + Number(b.carriedForward) - Number(b.used),
    }));
  }

  async getAllBalances(query: any, currentUser?: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const year = Number(query.year ?? new Date().getFullYear());
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const qb = this.leaveBalanceRepo.createQueryBuilder('balance');
    qb.leftJoinAndSelect('balance.employee', 'employee');
    qb.leftJoinAndSelect('balance.leaveType', 'leaveType');
    qb.where('balance.year = :year', { year });
    qb.andWhere('balance.tenantId = :tenantId', { tenantId });
    qb.orderBy('employee.first_name', 'ASC');

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
      });
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => ({
        employeeId: item.employeeId,
        employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
        employeeCode: item.employee.employeeCode,
        leaveType: item.leaveType.name,
        accrued: item.accrued,
        used: item.used,
        carriedForward: item.carriedForward,
        remaining:
          Number(item.accrued) +
          Number(item.carriedForward) -
          Number(item.used),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
