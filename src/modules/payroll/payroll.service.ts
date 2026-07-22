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
import { Leave } from './../attendance/entities/leave.entity';

import { SalaryStructure } from './../salary-structure/entities/salary-structure.entity';
import { LeavePolicy } from '../leave-policy/entities/leave-policy.entity';
import { WeekendSetting } from '../weekend_settings/entities/weekend_setting.entity';
import { AttendanceStatus } from './../../common/enums/AttendanceStatus.enum';
import { DataScopeService } from './../../common/services/data-scope.service';

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

    @InjectRepository(Leave)
    private readonly leaveRequestRepo: Repository<Leave>,

    @InjectRepository(LeavePolicy)
    private readonly leavePolicyRepo: Repository<LeavePolicy>,

    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>,

    private readonly dataScopeService: DataScopeService,
  ) {}

  // =====================
  // GENERATE PAYROLL
  // =====================

  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  async generatePayroll(
    employeeId: string, 
    month: number, 
    year: number,
    options?: { bonusAmount?: number; bonusReason?: string; deductionAmount?: number; deductionReason?: string },
    precalculatedWeekends?: WeekendSetting[]
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
    const weekends = precalculatedWeekends ?? await this.weekendRepo.find({ where: { isOff: true } });
    const workingDays = this.calculateWorkingDays(year, month, weekends, employee.joiningDate);
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
    
    const leaveDays = attendances.filter(
      (item) => item.status === AttendanceStatus.LEAVE,
    ).length;

    // LEAVE RECONCILIATION
    let paidLeaves = 0;
    let unpaidLeaves = 0;

    const approvedLeaves = await this.leaveRequestRepo.createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.status = :status', { status: 'APPROVED' })
      .andWhere('(leave.startDate <= :endDate AND leave.endDate >= :startDate)', { startDate, endDate })
      .getMany();

    for (const req of approvedLeaves) {
      // Find overlap days in this month
      const startOverlap = new Date(Math.max(new Date(req.startDate).getTime(), new Date(startDate).getTime()));
      const endOverlap = new Date(Math.min(new Date(req.endDate).getTime(), new Date(endDate).getTime()));
      
      const overlapDays = Math.max(0, (endOverlap.getTime() - startOverlap.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Get policy for isPaid
      const policy = await this.leavePolicyRepo.findOne({
        where: { leaveTypeId: req.leaveTypeId, isActive: true }
      });

      if (policy && policy.isPaid) {
        paidLeaves += overlapDays;
      } else {
        unpaidLeaves += overlapDays;
      }
    }

    // UNIFIED RECONCILIATION FORMULA
    const totalAttendanceMissing = absentDays + leaveDays + (halfDays * 0.5);
    const totalApprovedLeaves = paidLeaves + unpaidLeaves;
    const unapprovedMissingDays = Math.max(0, totalAttendanceMissing - totalApprovedLeaves);

    const perDaySalary = this.roundCurrency(Number(salary.netSalary) / effectiveWorkingDays);
    const perHourSalary = this.roundCurrency(perDaySalary / 8); 

    // Allocate deductions gracefully
    let remainingUnapproved = unapprovedMissingDays;
    
    const allocatedHalfDays = Math.min(remainingUnapproved, halfDays * 0.5);
    const halfDayDeduction = this.roundCurrency(allocatedHalfDays * perDaySalary);
    remainingUnapproved -= allocatedHalfDays;
    
    const absentDeduction = this.roundCurrency(remainingUnapproved * perDaySalary);
    const leaveDeduction = this.roundCurrency(unpaidLeaves * perDaySalary);

    // OVERTIME
    const overtimeMinutes = attendances.reduce((acc, curr) => acc + (curr.overtimeMinutes ?? 0), 0);
    const overtimeHours = this.roundCurrency(overtimeMinutes / 60);
    const overtimeAmount = this.roundCurrency(overtimeHours * perHourSalary);

    // LATE DEDUCTION (Per Minute)
    const lateMinutes = attendances
      .filter((item) => item.status !== AttendanceStatus.HALF_DAY)
      .reduce((acc, curr) => acc + (curr.lateMinutes ?? 0), 0);
    const lateHours = this.roundCurrency(lateMinutes / 60);
    const lateDeduction = this.roundCurrency(lateHours * perHourSalary);

    // OVERRIDES
    const bonusAmount = this.roundCurrency(options?.bonusAmount ? Number(options.bonusAmount) : 0);
    const bonusReason = options?.bonusReason || null;
    const deductionAmount = this.roundCurrency(options?.deductionAmount ? Number(options.deductionAmount) : 0);
    const deductionReason = options?.deductionReason || null;

    const finalSalary = this.roundCurrency(
      Number(salary.netSalary) -
      absentDeduction -
      halfDayDeduction -
      leaveDeduction -
      lateDeduction +
      overtimeAmount +
      bonusAmount -
      deductionAmount
    );

    // SAVE
    const payroll = await this.payrollRepo.save({
      employeeId,

      month,

      year,

      grossSalary: salary.grossSalary,
      netSalary: salary.netSalary,

      baseBasicSalary: salary.basicSalary ? Number(salary.basicSalary) : 0,
      baseHra: salary.hra ? Number(salary.hra) : 0,
      baseAllowance: salary.allowance ? Number(salary.allowance) : 0,
      basePf: salary.pf ? Number(salary.pf) : 0,
      baseEsic: salary.esic ? Number(salary.esic) : 0,
      baseProfessionalTax: salary.professionalTax ? Number(salary.professionalTax) : 0,

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

  async findAll(query: any, currentUser: Employee) {
    const {
      month,
      year,
      employeeId,

      page = 1,
      limit = 10,
    } = query;

    const parsedPage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const parsedLimit = Math.max(1, isNaN(Number(limit)) ? 10 : Number(limit));

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

    this.dataScopeService.applyScope(qb, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });

    qb.orderBy('payroll.createdAt', 'DESC');

    qb.skip((parsedPage - 1) * parsedLimit);

    qb.take(parsedLimit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,

      meta: {
        total,

        page: parsedPage,

        limit: parsedLimit,

        totalPages: Math.ceil(total / parsedLimit),
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

  async payAll(month: number, year: number) {
    const payrolls = await this.payrollRepo.find({
      where: { month, year, isPaid: false },
    });

    if (payrolls.length === 0) {
      return { message: 'No unpaid payrolls found for the specified month and year', paidCount: 0 };
    }

    const paidAt = new Date();
    payrolls.forEach(p => {
      p.isPaid = true;
      p.paidAt = paidAt;
    });

    await this.payrollRepo.save(payrolls);

    return {
      message: `Successfully marked ${payrolls.length} payroll(s) as paid`,
      paidCount: payrolls.length,
    };
  }

  async generateAllPayroll(month: number, year: number) {
    const employees = await this.employeeRepo.find({
      where: { isActive: true },
      select: { id: true },
    });

    const weekends = await this.weekendRepo.find({ where: { isOff: true } });

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
          await this.generatePayroll(employee.id, month, year, undefined, weekends);
          generated++;
        } catch (error: any) {
          if (error.message === 'Payroll already generated') {
            skipped++;
          } else {
            failed++;
            errors.push({ employeeId: employee.id, reason: error.message });
          }
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

  @Cron('59 23 28-31 * *', { timeZone: 'Asia/Kolkata' })
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

  private calculateWorkingDays(year: number, month: number, weekends: WeekendSetting[], joiningDate?: Date | null) {
    const lastDay = new Date(year, month, 0).getDate();
    
    let startDay = 1;
    if (joiningDate) {
       const jDate = new Date(joiningDate);
       if (jDate.getFullYear() === year && (jDate.getMonth() + 1) === month) {
         startDay = jDate.getDate();
       } else if (jDate.getFullYear() > year || (jDate.getFullYear() === year && (jDate.getMonth() + 1) > month)) {
         return 0; // Joined after this month
       }
    }

    let workingDays = 0;
    
    for (let day = startDay; day <= lastDay; day++) {
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
