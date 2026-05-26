import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, IsNull } from 'typeorm';

import dayjs from 'dayjs';

import { Cron } from '@nestjs/schedule';
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

  private readonly MONTHLY_LEAVE = 2;

  private readonly MAX_CARRY_FORWARD = 6;

  @Cron('1 0 1 * *', {
    timeZone: 'Asia/Kolkata',
  })
  async creditMonthlyLeave() {
    const month = dayjs().month() + 1;

    const year = dayjs().year();

    const previousMonth = month === 1 ? 12 : month - 1;

    const previousYear = month === 1 ? year - 1 : year;

    const employees = await this.employeeRepo.find({
      where: {
        isActive: true,

        deletedAt: IsNull(),
      },

      select: {
        id: true,
      },
    });

    for (const employee of employees) {
      const existing = await this.leaveBalanceRepo.findOne({
        where: {
          employeeId: employee.id,

          month,

          year,
        },
      });

      if (existing) {
        continue;
      }

      // PREVIOUS MONTH
      const previousBalance = await this.leaveBalanceRepo.findOne({
        where: {
          employeeId: employee.id,

          month: previousMonth,

          year: previousYear,
        },
      });

      const carryForward = Math.min(
        previousBalance?.remainingLeaves ?? 0,

        this.MAX_CARRY_FORWARD,
      );

      const remainingLeaves = this.MONTHLY_LEAVE + carryForward;

      await this.leaveBalanceRepo.save({
        employeeId: employee.id,

        month,

        year,

        monthlyCredit: this.MONTHLY_LEAVE,

        carryForward,

        usedLeaves: 0,

        remainingLeaves,
      });
    }

    console.log('Monthly leave credited');
  }

  private async createMonthlyBalance(
    employeeId: string,
    month: number,
    year: number,
  ) {
    const previousMonth = month === 1 ? 12 : month - 1;

    const previousYear = month === 1 ? year - 1 : year;

    const previousBalance = await this.leaveBalanceRepo.findOne({
      where: {
        employeeId,

        month: previousMonth,

        year: previousYear,
      },
    });

    const carryForward = Math.min(
      previousBalance?.remainingLeaves ?? 0,

      this.MAX_CARRY_FORWARD,
    );

    const remainingLeaves = this.MONTHLY_LEAVE + carryForward;

    const created = await this.leaveBalanceRepo.save({
      employeeId,

      month,

      year,

      monthlyCredit: this.MONTHLY_LEAVE,

      carryForward,

      usedLeaves: 0,

      remainingLeaves,
    });

    return this.leaveBalanceRepo.findOneOrFail({
      where: {
        id: created.id,
      },

      relations: {
        employee: true,
      },
    });
  }

  async deductLeave(employeeId: string, days: number) {
    const month = dayjs().month() + 1;

    const year = dayjs().year();

    const balance = await this.leaveBalanceRepo.findOne({
      where: {
        employeeId,
        month,
        year,
      },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    const available = balance.remainingLeaves;
    const paidLeaves = Math.min(available, days);
    const unpaidLeaves = Math.max(0, days - available);

    balance.usedLeaves += days;
    balance.paidLeavesUsed += paidLeaves;
    balance.unpaidLeavesUsed += unpaidLeaves;
    balance.remainingLeaves -= paidLeaves;

    await this.leaveBalanceRepo.save(balance);

    return {
      totalLeaves: days,
      paidLeaves,
      unpaidLeaves,
      remainingLeaves: balance.remainingLeaves,
    };
  }

  async getEmployeeBalance(employeeId: string) {
    const month = dayjs().month() + 1;

    const year = dayjs().year();

    let balance = await this.leaveBalanceRepo.findOne({
      where: {
        employeeId,
        month,
        year,
      },

      relations: {
        employee: true,
      },
    });

    if (!balance) {
      balance = await this.createMonthlyBalance(employeeId, month, year);
    }

    return {
      employee: {
        id: balance.employee.id,

        name: `${balance.employee.firstName} ${balance.employee.lastName}`,

        employeeCode: balance.employee.employeeCode,
      },

      month,

      year,

      monthlyCredit: balance.monthlyCredit,
      carryForward: balance.carryForward,
      usedLeaves: balance.usedLeaves,
      paidLeavesUsed: balance.paidLeavesUsed,
      unpaidLeavesUsed: balance.unpaidLeavesUsed,
      remainingLeaves: balance.remainingLeaves,
    };
  }

  async getAllBalances(query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const month = Number(query.month ?? dayjs().month() + 1);
    const year = Number(query.year ?? dayjs().year());
    const qb = this.leaveBalanceRepo.createQueryBuilder('balance');
    qb.leftJoinAndSelect('balance.employee', 'employee');
    qb.where('balance.month = :month', {
      month,
    });
    qb.andWhere('balance.year = :year', {
      year,
    });
    qb.orderBy('employee.first_name', 'ASC');

    qb.skip((page - 1) * limit);

    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => ({
        employeeId: item.employeeId,

        employeeName: `${item.employee.firstName} ${item.employee.lastName}`,

        employeeCode: item.employee.employeeCode,

        monthlyCredit: item.monthlyCredit,

        carryForward: item.carryForward,

        usedLeaves: item.usedLeaves,

        remainingLeaves: item.remainingLeaves,
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
