import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, Between } from 'typeorm';

import { Payroll } from './entities/payroll.entity';

import { Employee } from './../employees/entities/employee.entity';

import { Attendance } from './../attendance/entities/attendance.entity';

import { SalaryStructure } from './../salary-structure/entities/salary-structure.entity';

import { LeaveBalance } from './../leave-balance/entities/leave-balance.entity';

import { AttendanceStatus } from './../../common/enums/AttendanceStatus.enum';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(SalaryStructure)
    private readonly salaryRepo: Repository<SalaryStructure>,

    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
  ) {}

  // =====================
  // GENERATE PAYROLL
  // =====================

  async generatePayroll(employeeId: string, month: number, year: number) {
    const existing = await this.payrollRepo.findOne({
      where: {
        employeeId,

        month,

        year,
      },
    });

    if (existing) {
      throw new BadRequestException('Payroll already generated');
    }

    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const salary = await this.salaryRepo.findOne({
      where: {
        employeeId,

        isActive: true,
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    // ATTENDANCE
    const attendances = await this.attendanceRepo.find({
      where: {
        employeeId,

        date: Between(startDate, endDate),
      },
    });

    const presentDays = attendances.filter(
      (item) => item.status === AttendanceStatus.PRESENT,
    ).length;

    const lateDays = attendances.filter(
      (item) => item.status === AttendanceStatus.LATE,
    ).length;

    const halfDays = attendances.filter(
      (item) => item.status === AttendanceStatus.HALF_DAY,
    ).length;

    const absentDays = attendances.filter(
      (item) => item.status === AttendanceStatus.ABSENT,
    ).length;

    // LEAVE BALANCE
    const leaveBalance = await this.leaveBalanceRepo.findOne({
      where: {
        employeeId,

        month,

        year,
      },
    });

    const paidLeaves = leaveBalance?.paidLeavesUsed ?? 0;

    const unpaidLeaves = leaveBalance?.unpaidLeavesUsed ?? 0;

    const workingDays = 30;

    const perDaySalary = Number(salary.netSalary) / workingDays;

    const absentDeduction = absentDays * perDaySalary;

    const halfDayDeduction = halfDays * (perDaySalary / 2);

    const leaveDeduction = unpaidLeaves * perDaySalary;

    const overtimeMinutes = attendances.reduce(
      (acc, curr) => acc + (curr.overtimeMinutes ?? 0),

      0,
    );

    const overtimeHours = overtimeMinutes / 60;

    const perHourSalary = perDaySalary / 8;

    const overtimeAmount = overtimeHours * perHourSalary;

    const finalSalary =
      Number(salary.netSalary) -
      absentDeduction -
      halfDayDeduction -
      leaveDeduction +
      overtimeAmount;

    // SAVE
    const payroll = await this.payrollRepo.save({
      employeeId,

      month,

      year,

      grossSalary: salary.grossSalary,

      netSalary: salary.netSalary,

      presentDays,

      lateDays,

      halfDays,

      absentDays,

      paidLeaves,

      unpaidLeaves,

      absentDeduction,

      halfDayDeduction,

      leaveDeduction,

      overtimeAmount,

      finalSalary,
    });

    return payroll;
  }

  async getMyPayroll(employeeId: string) {
    const data = await this.payrollRepo.find({
      where: {
        employeeId,
      },

      order: {
        year: 'DESC',

        month: 'DESC',
      },
    });

    return {
      data,
      total: data.length,
    };
  }

  async findAll(query: any) {
    const {
      month,
      year,
      employeeId,

      page = 1,
      limit = 10,
    } = query;

    const qb = this.payrollRepo.createQueryBuilder('payroll');

    qb.leftJoinAndSelect('payroll.employee', 'employee');

    if (employeeId) {
      qb.andWhere(
        `
      payroll.employee_id = :employeeId
      `,
        {
          employeeId,
        },
      );
    }

    if (month) {
      qb.andWhere(
        `
      payroll.month = :month
      `,
        {
          month: Number(month),
        },
      );
    }

    if (year) {
      qb.andWhere(
        `
      payroll.year = :year
      `,
        {
          year: Number(year),
        },
      );
    }

    qb.orderBy('payroll.created_at', 'DESC');

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

  async markAsPaid(id: string) {
    const payroll = await this.payrollRepo.findOne({
      where: {
        id,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.isPaid) {
      throw new BadRequestException('Payroll already paid');
    }

    payroll.isPaid = true;

    payroll.paidAt = new Date();

    await this.payrollRepo.save(payroll);

    return payroll;
  }

  async generateAllPayroll(month: number, year: number) {
    const employees = await this.employeeRepo.find({
      where: {
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    let generated = 0;

    let skipped = 0;

    let failed = 0;

    const errors: {
      employeeId: string;
      reason: string;
    }[] = [];

    for (const employee of employees) {
      try {
        // CHECK DUPLICATE
        const existing = await this.payrollRepo.findOne({
          where: {
            employeeId: employee.id,

            month,

            year,
          },
        });

        if (existing) {
          skipped++;

          continue;
        }

        // REUSE EXISTING METHOD
        await this.generatePayroll(
          employee.id,

          month,

          year,
        );

        generated++;
      } catch (error: any) {
        failed++;

        errors.push({
          employeeId: employee.id,

          reason: error.message,
        });
      }
    }

    return {
      month,

      year,

      totalEmployees: employees.length,

      generated,

      skipped,

      failed,

      errors,
    };
  }
}
