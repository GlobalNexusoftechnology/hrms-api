import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async getEmployeeBalance(employeeId: string, year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    const balances = await this.leaveBalanceRepo.find({
      where: {
        employeeId,
        year: targetYear,
      },
      relations: { leaveType: true },
    });

    return balances.map(b => ({
      id: b.id,
      leaveType: b.leaveType,
      year: b.year,
      accrued: b.accrued,
      used: b.used,
      carriedForward: b.carriedForward,
      remaining: (Number(b.accrued) + Number(b.carriedForward)) - Number(b.used)
    }));
  }

  async getAllBalances(query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const year = Number(query.year ?? new Date().getFullYear());
    
    const qb = this.leaveBalanceRepo.createQueryBuilder('balance');
    qb.leftJoinAndSelect('balance.employee', 'employee');
    qb.leftJoinAndSelect('balance.leaveType', 'leaveType');
    qb.where('balance.year = :year', { year });
    qb.orderBy('employee.first_name', 'ASC');

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
        remaining: (Number(item.accrued) + Number(item.carriedForward)) - Number(item.used),
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
