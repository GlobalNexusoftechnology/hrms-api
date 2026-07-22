import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import dayjs from 'dayjs';

import { Attendance } from '../entities/attendance.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';

import { formatIST, todayIST } from '../../../utils/time.util';
import { DataScopeService } from '../../../common/services/data-scope.service';

@Injectable()
export class AttendanceDashboardService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    private readonly dataScopeService: DataScopeService,
  ) {}

  async getEmployeeDashboard(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const today = todayIST();

    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');

    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const todayAttendance = await this.attendanceRepo.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    const all = await this.attendanceRepo.find({
      where: {
        employeeId,
      },
    });

    const weekly = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', {
        employeeId,
      })
      .andWhere('attendance.date BETWEEN :start AND :end', {
        start: startOfWeek,

        end: endOfWeek,
      })
      .getMany();

    const monthly = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', {
        employeeId,
      })
      .andWhere('attendance.date BETWEEN :start AND :end', {
        start: startOfMonth,

        end: endOfMonth,
      })
      .getMany();

    const totalWorkedMinutes = all.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    const monthlyWorkedMinutes = monthly.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    return {
      today: todayAttendance
        ? {
            status: todayAttendance.status,

            checkIn: formatIST(todayAttendance.checkIn),

            checkOut: formatIST(todayAttendance.checkOut),

            workedHours: Number(
              (todayAttendance.workedMinutes / 60).toFixed(2),
            ),
          }
        : null,

      summary: {
        present: all.filter((a) => a.status === AttendanceStatus.PRESENT)
          .length,

        late: all.filter((a) => a.status === AttendanceStatus.LATE).length,

        halfDay: all.filter((a) => a.status === AttendanceStatus.HALF_DAY)
          .length,

        leave: all.filter((a) => a.status === AttendanceStatus.LEAVE).length,

        absent: all.filter((a) => a.status === AttendanceStatus.ABSENT).length,
      },

      workingHours: {
        workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),

        expectedHours: all.length * 8,

        completionPercentage: all.length
          ? Number(
              ((totalWorkedMinutes / 60 / (all.length * 8)) * 100).toFixed(2),
            )
          : 0,
      },

      weekly: {
        total: weekly.length,

        workedHours: Number(
          (
            weekly.reduce((acc, curr) => acc + curr.workedMinutes, 0) / 60
          ).toFixed(2),
        ),
      },

      monthly: {
        total: monthly.length,

        workedHours: Number((monthlyWorkedMinutes / 60).toFixed(2)),
      },
    };
  }

  async getHrDashboard(currentUser: Employee) {
    const today = todayIST();

    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');

    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const qbEmployee = this.employeeRepo.createQueryBuilder('employee')
      .where('employee.is_active = :isActive', { isActive: true })
      .andWhere('employee.deleted_at IS NULL');
    this.dataScopeService.applyScope(qbEmployee, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });
    const totalEmployees = await qbEmployee.getCount();

    const qbToday = this.attendanceRepo.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .where('attendance.date = :today', { today });
    this.dataScopeService.applyScope(qbToday, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });
    const todayAttendance = await qbToday.getMany();

    const present = todayAttendance.filter(
      (item) => item.status === AttendanceStatus.PRESENT,
    ).length;

    const late = todayAttendance.filter(
      (item) => item.status === AttendanceStatus.LATE,
    ).length;

    const halfDay = todayAttendance.filter(
      (item) => item.status === AttendanceStatus.HALF_DAY,
    ).length;

    const leave = todayAttendance.filter(
      (item) => item.status === AttendanceStatus.LEAVE,
    ).length;

    const absent = todayAttendance.filter(
      (item) => item.status === AttendanceStatus.ABSENT,
    ).length;

    const qbWeekly = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfWeek,

        end: endOfWeek,
      });
    this.dataScopeService.applyScope(qbWeekly, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });
    const weeklyAttendance = await qbWeekly.getMany();

    const qbMonthly = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfMonth,

        end: endOfMonth,
      });
    this.dataScopeService.applyScope(qbMonthly, currentUser, {
      branch: 'employee.branchId',
      department: 'employee.departmentId',
      employee: 'employee.id'
    });
    const monthlyAttendance = await qbMonthly.getMany();

    const totalWorkedMinutes = monthlyAttendance.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    return {
      employees: {
        total: totalEmployees,

        present,
        late,
        halfDay,
        leave,
        absent,

        attendancePercentage: totalEmployees
          ? Number(((todayAttendance.length / totalEmployees) * 100).toFixed(2))
          : 0,
      },

      daily: {
        attendanceCount: todayAttendance.length,

        workedHours: Number(
          (
            todayAttendance.reduce(
              (acc, curr) => acc + (curr.workedMinutes || 0),
              0,
            ) / 60
          ).toFixed(2),
        ),
      },

      weekly: {
        totalAttendance: weeklyAttendance.length,

        present: weeklyAttendance.filter(
          (a) => a.status === AttendanceStatus.PRESENT,
        ).length,

        late: weeklyAttendance.filter((a) => a.status === AttendanceStatus.LATE)
          .length,

        halfDay: weeklyAttendance.filter(
          (a) => a.status === AttendanceStatus.HALF_DAY,
        ).length,
      },

      monthly: {
        totalAttendance: monthlyAttendance.length,

        workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),
      },
    };
  }
}
