import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, Between, IsNull, MoreThanOrEqual } from 'typeorm';

import dayjs from 'dayjs';

import { Employee } from '../employees/entities/employee.entity';

import { Department } from '../departments/entities/department.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { Leave } from '../attendance/entities/leave.entity';

import { Candidate } from '../interview/entities/candidate.entity';

import { Course } from '../training/entities/course.entity';

import { Payroll } from '../payroll/entities/payroll.entity';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { Holiday } from '../holiday/entities/holiday.entity';

import { CandidateStatusEnum } from '../../common/enums/candidate-status.enum';

import { AttendanceStatus } from '../../common/enums/AttendanceStatus.enum';

import { LeaveStatusEnum } from '../../common/enums/leave-status.enum';

import { todayIST } from '../../utils/time.util';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,

    @InjectRepository(Course)
    private readonly trainingRepo: Repository<Course>,

    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,

    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,

    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
  ) {}

  async getSuperAdminDashboard() {
    const [
      totalEmployees,
      activeEmployees,
      departments,
      pendingInterviews,
      selectedCandidates,
      trainings,
      todayAttendance,
      weeklyAttendance,
      monthlyAttendance,
      allLeaves,
      pendingLeaves,
      approvedLeaves,
      upcomingHolidays,
      currentMonthPayrolls,
    ] = await Promise.all([
      this.employeeRepo.count(),

      this.employeeRepo.count({
        where: {
          isActive: true,
        },
      }),

      this.departmentRepo.count(),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.INTERVIEW_SCHEDULED,
        },
      }),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.SELECTED,
        },
      }),

      this.trainingRepo.count(),

      this.attendanceRepo.find({
        where: {
          date: todayIST(),
        },
      }),

      this.getWeeklyAttendance(),

      this.getMonthlyAttendance(),

      this.leaveRepo.count(),

      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.PENDING,
        },
      }),

      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.APPROVED,
        },
      }),

      this.holidayRepo.find({
        where: { date: MoreThanOrEqual(todayIST()) },
        order: { date: 'ASC' },
        take: 5,
      }),

      this.payrollRepo.find({
        where: { month: dayjs().month() + 1, year: dayjs().year() },
      }),
    ]);

    const totalPayrollCost = currentMonthPayrolls.reduce((sum, p) => sum + Number(p.netSalary), 0);

    const todayAttendanceStats = this.calculateAttendanceStats(todayAttendance);

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },

      departments,

      recruitment: {
        pendingInterviews,
        selectedCandidates,
      },

      trainings,

      attendance: {
        today: todayAttendanceStats,
        weekly: weeklyAttendance,
        monthly: monthlyAttendance,
      },

      leaves: {
        total: allLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: await this.leaveRepo.count({
          where: {
            status: LeaveStatusEnum.REJECTED,
          },
        }),
      },

      holidays: {
        upcoming: upcomingHolidays,
      },

      payroll: {
        totalCurrentMonth: totalPayrollCost,
      },
    };
  }

  async getHrDashboard() {
    const [
      totalEmployees,
      pendingCandidates,
      selectedCandidates,
      rejectedCandidates,
      scheduledInterviews,
      todayAttendance,
      weeklyAttendance,
      monthlyAttendance,
      departmentWiseAttendance,
      leaveStats,
      upcomingHolidays,
      currentMonthPayrolls,
    ] = await Promise.all([
      this.employeeRepo.count(),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.APPLIED,
        },
      }),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.SELECTED,
        },
      }),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.REJECTED,
        },
      }),

      this.candidateRepo.count({
        where: {
          status: CandidateStatusEnum.INTERVIEW_SCHEDULED,
        },
      }),

      this.attendanceRepo.find({
        where: {
          date: todayIST(),
        },
        relations: {
          employee: {
            department: true,
          },
        },
      }),

      this.getWeeklyAttendance(),

      this.getMonthlyAttendance(),

      this.getDepartmentWiseAttendance(),

      this.getLeaveStats(),

      this.holidayRepo.find({
        where: { date: MoreThanOrEqual(todayIST()) },
        order: { date: 'ASC' },
        take: 5,
      }),

      this.payrollRepo.find({
        where: { month: dayjs().month() + 1, year: dayjs().year() },
      }),
    ]);

    const totalPayrollCost = currentMonthPayrolls.reduce((sum, p) => sum + Number(p.netSalary), 0);

    const todayAttendanceStats = this.calculateAttendanceStats(todayAttendance);

    return {
      recruitment: {
        totalEmployees,
        pendingCandidates,
        selectedCandidates,
        rejectedCandidates,
        scheduledInterviews,
      },

      attendance: {
        today: {
          ...todayAttendanceStats,
          attendanceRate: totalEmployees
            ? Number(
                ((todayAttendance.length / totalEmployees) * 100).toFixed(2),
              )
            : 0,
        },
        weekly: weeklyAttendance,
        monthly: monthlyAttendance,
        byDepartment: departmentWiseAttendance,
      },

      leaves: leaveStats,

      holidays: {
        upcoming: upcomingHolidays,
      },

      payroll: {
        totalCurrentMonth: totalPayrollCost,
      },
    };
  }

  async getEmployeeDashboard(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
      },
      relations: {
        department: true,
        designation: true,
      },
    });

    if (!employee) {
      return null;
    }

    const [
      todayAttendance,
      weeklyAttendance,
      monthlyAttendance,
      leaveBalance,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      upcomingHolidays,
      latestPayroll,
    ] = await Promise.all([
      this.attendanceRepo.findOne({
        where: {
          employeeId,
          date: todayIST(),
        },
      }),

      this.getEmployeeWeeklyAttendance(employeeId),

      this.getEmployeeMonthlyAttendance(employeeId),

      this.getLeaveBalance(employeeId),

      this.leaveRepo.count({
        where: {
          employeeId,
          status: LeaveStatusEnum.PENDING,
        },
      }),

      this.leaveRepo.count({
        where: {
          employeeId,
          status: LeaveStatusEnum.APPROVED,
        },
      }),

      this.leaveRepo.count({
        where: {
          employeeId,
          status: LeaveStatusEnum.REJECTED,
        },
      }),

      this.holidayRepo.find({
        where: { date: MoreThanOrEqual(todayIST()) },
        order: { date: 'ASC' },
        take: 5,
      }),

      this.payrollRepo.findOne({
        where: { employeeId },
        order: { year: 'DESC', month: 'DESC' },
      }),
    ]);

    return {
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.department?.name,
        designation: employee.designation?.name,
        isActive: employee.isActive,
      },

      attendance: {
        today: todayAttendance
          ? {
              status: todayAttendance.status,
              checkIn: todayAttendance.checkIn,
              checkOut: todayAttendance.checkOut,
              workedMinutes: todayAttendance.workedMinutes,
              workedHours: Number(
                (todayAttendance.workedMinutes / 60).toFixed(2),
              ),
            }
          : null,
        weekly: weeklyAttendance,
        monthly: monthlyAttendance,
      },

      leaves: {
        leaveBalance,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },

      holidays: {
        upcoming: upcomingHolidays,
      },

      payroll: {
        latest: latestPayroll,
      },
    };
  }

  // ============================================
  // HELPER METHODS FOR ATTENDANCE CALCULATIONS
  // ============================================

  private calculateAttendanceStats(attendanceRecords: Attendance[]) {
    const stats = {
      total: attendanceRecords.length,
      present: 0,
      late: 0,
      halfDay: 0,
      leave: 0,
      absent: 0,
      holiday: 0,
      weekend: 0,
    };

    attendanceRecords.forEach((record) => {
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          stats.present++;
          break;
        case AttendanceStatus.LATE:
          stats.late++;
          break;
        case AttendanceStatus.HALF_DAY:
          stats.halfDay++;
          break;
        case AttendanceStatus.LEAVE:
          stats.leave++;
          break;
        case AttendanceStatus.ABSENT:
          stats.absent++;
          break;
        case AttendanceStatus.HOLIDAY:
          stats.holiday++;
          break;
        case AttendanceStatus.WEEKEND:
          stats.weekend++;
          break;
      }
    });

    return stats;
  }

  private async getWeeklyAttendance() {
    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const records = await this.attendanceRepo.find({
      where: {
        date: Between(startOfWeek, endOfWeek),
      },
    });

    const stats = this.calculateAttendanceStats(records);

    return {
      period: `${startOfWeek} to ${endOfWeek}`,
      ...stats,
    };
  }

  private async getMonthlyAttendance() {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const records = await this.attendanceRepo.find({
      where: {
        date: Between(startOfMonth, endOfMonth),
      },
    });

    const stats = this.calculateAttendanceStats(records);

    return {
      period: dayjs().format('MMMM YYYY'),
      ...stats,
    };
  }

  private async getDepartmentWiseAttendance() {
    const today = todayIST();

    const departments = await this.departmentRepo.find();

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const attendance = await this.attendanceRepo.find({
          where: {
            date: today,
            employee: {
              departmentId: dept.id,
            },
          },
          relations: {
            employee: true,
          },
        });

        const stats = this.calculateAttendanceStats(attendance);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          ...stats,
        };
      }),
    );

    return departmentStats;
  }

  private async getLeaveStats() {
    const [pending, approved, rejected, cancelled] = await Promise.all([
      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.PENDING,
        },
      }),

      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.APPROVED,
        },
      }),

      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.REJECTED,
        },
      }),

      this.leaveRepo.count({
        where: {
          status: LeaveStatusEnum.CANCELLED,
        },
      }),
    ]);

    const today = todayIST();
    const upcomingLeaves = await this.leaveRepo.find({
      where: {
        status: LeaveStatusEnum.APPROVED,
        startDate: dayjs(today).add(1, 'day').format('YYYY-MM-DD'),
      },
    });

    return {
      pending,
      approved,
      rejected,
      cancelled,
      upcoming: upcomingLeaves.length,
      total: pending + approved + rejected + cancelled,
    };
  }

  private async getEmployeeWeeklyAttendance(employeeId: string) {
    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const records = await this.attendanceRepo.find({
      where: {
        employeeId,
        date: Between(startOfWeek, endOfWeek),
      },
    });

    const stats = this.calculateAttendanceStats(records);
    const totalWorkedMinutes = records.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    return {
      period: `${startOfWeek} to ${endOfWeek}`,
      ...stats,
      workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),
    };
  }

  private async getEmployeeMonthlyAttendance(employeeId: string) {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const records = await this.attendanceRepo.find({
      where: {
        employeeId,
        date: Between(startOfMonth, endOfMonth),
      },
    });

    const stats = this.calculateAttendanceStats(records);
    const totalWorkedMinutes = records.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    const expectedHours = stats.present * 8 + stats.halfDay * 4;
    const completionPercentage =
      expectedHours > 0
        ? Number(((totalWorkedMinutes / 60 / expectedHours) * 100).toFixed(2))
        : 0;

    return {
      period: dayjs().format('MMMM YYYY'),
      ...stats,
      workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),
      expectedHours,
      completionPercentage,
    };
  }

  private async getLeaveBalance(employeeId: string) {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();

    const balanceRecord = await this.leaveBalanceRepo.findOne({
      where: { employeeId, month: currentMonth, year: currentYear },
    });

    const approvedLeaves = await this.leaveRepo.find({
      where: {
        employeeId,
        status: LeaveStatusEnum.APPROVED,
      },
    });

    const totalLeaveDays = approvedLeaves.reduce((acc, leave) => {
      const days = dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;
      return acc + days;
    }, 0);

    return {
      totalApprovedDays: totalLeaveDays,
      leavesTaken: approvedLeaves.length,
      currentBalance: balanceRecord || null,
    };
  }
}
