import { Injectable } from '@nestjs/common';
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

    const calculateRemaining = (accrued: number | string, carriedForward: number | string, used: number | string): number => {
      const a = Math.round(Number(accrued || 0) * 100);
      const c = Math.round(Number(carriedForward || 0) * 100);
      const u = Math.round(Number(used || 0) * 100);
      return (a + c - u) / 100;
    };

    const balances = await qb.getMany();

    return balances.map((b) => ({
      id: b.id,
      leaveType: b.leaveType,
      year: b.year,
      accrued: Number(b.accrued),
      used: Number(b.used),
      carriedForward: Number(b.carriedForward),
      remaining: calculateRemaining(b.accrued, b.carriedForward, b.used),
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
    qb.leftJoinAndSelect('employee.department', 'department');
    qb.leftJoinAndSelect('employee.designation', 'designation');
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

    const calculateRemaining = (accrued: number | string, carriedForward: number | string, used: number | string): number => {
      const a = Math.round(Number(accrued || 0) * 100);
      const c = Math.round(Number(carriedForward || 0) * 100);
      const u = Math.round(Number(used || 0) * 100);
      return (a + c - u) / 100;
    };

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
