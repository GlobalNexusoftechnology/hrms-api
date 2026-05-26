import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import dayjs from 'dayjs';

import { Attendance } from '../entities/attendance.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';

import { formatIST, todayIST } from '../../../utils/time.util';

@Injectable()
export class AttendanceDashboardService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
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

  async getHrDashboard() {
    const today = todayIST();

    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');

    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const totalEmployees = await this.employeeRepo.count({
      where: {
        isActive: true,

        deletedAt: IsNull(),
      },
    });

    const todayAttendance = await this.attendanceRepo.find({
      where: {
        date: today,
      },

      relations: {
        employee: {
          department: true,
        },
      },
    });

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

    const weeklyAttendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfWeek,

        end: endOfWeek,
      })
      .getMany();

    const monthlyAttendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfMonth,

        end: endOfMonth,
      })
      .getMany();

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
