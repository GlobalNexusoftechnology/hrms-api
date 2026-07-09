import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, Between } from 'typeorm';

import { Payroll } from './entities/payroll.entity';

import { Employee } from './../employees/entities/employee.entity';

import { Attendance } from './../attendance/entities/attendance.entity';

import { SalaryStructure } from './../salary-structure/entities/salary-structure.entity';

import { LeaveBalance } from './../leave-balance/entities/leave-balance.entity';
import { WeekendSetting } from '../weekend_settings/entities/weekend_setting.entity';
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

    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>,
  ) {}

  // =====================
  // GENERATE PAYROLL
  // =====================

  async generatePayroll(
    employeeId: string, 
    month: number, 
    year: number,
    options?: { bonusAmount?: number; bonusReason?: string; deductionAmount?: number; deductionReason?: string }
  ) {
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
      where: { id: employeeId },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const salary = await this.salaryRepo.findOne({
      where: { employeeId, isActive: true },
    });

    if (!salary) throw new NotFoundException('Salary structure not found');

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // WORKING DAYS CALCULATION
    const workingDays = await this.calculateWorkingDays(year, month);
    // Fallback just in case working days evaluates to 0
    const effectiveWorkingDays = workingDays > 0 ? workingDays : lastDay;

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

    const perDaySalary = Number(salary.netSalary) / effectiveWorkingDays;
    const perHourSalary = perDaySalary / 8; // Still hardcoded to 8 hours as requested

    const absentDeduction = absentDays * perDaySalary;
    const halfDayDeduction = halfDays * (perDaySalary / 2);
    const leaveDeduction = unpaidLeaves * perDaySalary;

    // OVERTIME
    const overtimeMinutes = attendances.reduce((acc, curr) => acc + (curr.overtimeMinutes ?? 0), 0);
    const overtimeHours = overtimeMinutes / 60;
    const overtimeAmount = overtimeHours * perHourSalary;

    // LATE DEDUCTION (Per Minute)
    const lateMinutes = attendances.reduce((acc, curr) => acc + (curr.lateMinutes ?? 0), 0);
    const lateHours = lateMinutes / 60;
    const lateDeduction = lateHours * perHourSalary;

    // OVERRIDES
    const bonusAmount = options?.bonusAmount ? Number(options.bonusAmount) : 0;
    const bonusReason = options?.bonusReason || null;
    const deductionAmount = options?.deductionAmount ? Number(options.deductionAmount) : 0;
    const deductionReason = options?.deductionReason || null;

    const finalSalary =
      Number(salary.netSalary) -
      absentDeduction -
      halfDayDeduction -
      leaveDeduction -
      lateDeduction +
      overtimeAmount +
      bonusAmount -
      deductionAmount;

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
      lateDeduction,
      overtimeAmount,
      bonusAmount,
      bonusReason,
      deductionAmount,
      deductionReason,
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
      where: { isActive: true },
      select: { id: true },
    });

    let generated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { employeeId: string; reason: string }[] = [];

    // Batch process 50 at a time
    const batchSize = 50;
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      
      const promises = batch.map(async (employee) => {
        try {
          // CHECK DUPLICATE
          const existing = await this.payrollRepo.findOne({
            where: { employeeId: employee.id, month, year },
          });

          if (existing) {
            skipped++;
            return;
          }

          await this.generatePayroll(employee.id, month, year);
          generated++;
        } catch (error: any) {
          failed++;
          errors.push({ employeeId: employee.id, reason: error.message });
        }
      });

      await Promise.allSettled(promises);
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

  @Cron('59 23 28-31 * *')
  async handleCronGenerateAllPayroll() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // If tomorrow is the 1st, then today is the last day of the month
    if (tomorrow.getDate() === 1) {
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      console.log(`[Payroll Cron] Auto-generating payrolls for ${month}/${year}`);
      await this.generateAllPayroll(month, year);
    }
  }

  private async calculateWorkingDays(year: number, month: number) {
    const lastDay = new Date(year, month, 0).getDate();
    const weekends = await this.weekendRepo.find({ where: { isOff: true } });
    
    let workingDays = 0;
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeekStr = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      
      const occurrence = Math.ceil(day / 7);
      const occurrenceStr = occurrence === 1 ? 'FIRST' : occurrence === 2 ? 'SECOND' : occurrence === 3 ? 'THIRD' : occurrence === 4 ? 'FOURTH' : occurrence === 5 ? 'FIFTH' : 'UNKNOWN';

      const isWeekend = weekends.some(w => w.day === dayOfWeekStr && (w.weekNumber === 'ALL' || w.weekNumber === occurrenceStr));
      
      if (!isWeekend) {
        workingDays++;
      }
    }
    
    return workingDays;
  }
}
