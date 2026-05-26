import { Injectable } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, IsNull, Repository } from 'typeorm';

import { Attendance } from '../entities/attendance.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { Holiday } from '../../holiday/entities/holiday.entity';

import { WeekendSetting } from '../../weekend_settings/entities/weekend_setting.entity';

import { Leave } from '../entities/leave.entity';

import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';

import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

import { nowIST, todayIST } from '../../../utils/time.util';
import { WeekNumberEnum } from '../../../common/enums/WeekNumberEnum.enum';
import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';

@Injectable()
export class AttendanceCronService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,

    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>,

    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,

    private readonly dataSource: DataSource,
  ) {}

  // =====================
  // AUTO CHECKOUT
  // 8:00 PM IST
  // =====================

  @Cron('0 20 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoCheckOut() {
    const today = todayIST();

    console.log('AUTO CHECKOUT RUNNING');

    const autoCheckoutTime = nowIST()
      .hour(20)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();

    await this.dataSource.transaction(async (manager) => {
      const records = await manager
        .createQueryBuilder(Attendance, 'attendance')
        .setLock('pessimistic_write')
        .where(
          `
            attendance.date = :today
            `,
          {
            today,
          },
        )
        .andWhere(
          `
            attendance.check_out IS NULL
            `,
        )
        .andWhere(
          `
            attendance.check_in IS NOT NULL
            `,
        )
        .andWhere(
          `
            attendance.status NOT IN (
              :...excluded
            )
            `,
          {
            excluded: [
              AttendanceStatus.HOLIDAY,

              AttendanceStatus.WEEKEND,

              AttendanceStatus.LEAVE,

              AttendanceStatus.ABSENT,
            ],
          },
        )
        .getMany();

      for (const attendance of records) {
        // =====================
        // AUTO CHECKOUT
        // =====================

        attendance.checkOut = autoCheckoutTime;

        attendance.checkOutLocation = 'AUTO';

        attendance.isAutoCheckout = true;

        // AUTO MESSAGE
        if (!attendance.earlyCheckoutReason) {
          attendance.earlyCheckoutReason = 'Auto checkout (forgot to checkout)';
        }

        // =====================
        // WORKED TIME
        // =====================

        const workedMinutes = Math.floor(
          (attendance.checkOut.getTime() - attendance.checkIn!.getTime()) /
            60000,
        );

        attendance.workedMinutes = workedMinutes;

        // =====================
        // OVERTIME
        // =====================

        attendance.overtimeMinutes =
          workedMinutes > 480 ? workedMinutes - 480 : 0;

        // =====================
        // SAVE
        // =====================

        await manager.save(attendance);
      }
    });

    console.log('AUTO CHECKOUT COMPLETED');
  }

  // =====================
  // AUTO HOLIDAY
  // 12:01 AM
  // =====================

  @Cron('1 0 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoMarkHoliday() {
    const today = todayIST();

    const holiday = await this.holidayRepo.findOne({
      where: {
        date: today,
      },
    });

    if (!holiday) {
      return;
    }

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
      const existing = await this.attendanceRepo.findOne({
        where: {
          employeeId: employee.id,

          date: today,
        },
      });

      if (existing) {
        continue;
      }

      await this.attendanceRepo.save({
        employeeId: employee.id,

        date: today,

        status: AttendanceStatus.HOLIDAY,
      });
    }
  }

  // =====================
  // AUTO WEEKEND
  // 12:05 AM
  // =====================

  @Cron('5 0 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoMarkWeekend() {
    const now = nowIST();

    const today = todayIST();

    const dayMap = {
      0: WeekDayEnum.SUNDAY,
      1: WeekDayEnum.MONDAY,
      2: WeekDayEnum.TUESDAY,
      3: WeekDayEnum.WEDNESDAY,
      4: WeekDayEnum.THURSDAY,
      5: WeekDayEnum.FRIDAY,
      6: WeekDayEnum.SATURDAY,
    };

    const currentDay = dayMap[now.day()];

    const weekOfMonth = Math.ceil(now.date() / 7);

    const weekMap = {
      1: WeekNumberEnum.FIRST,
      2: WeekNumberEnum.SECOND,
      3: WeekNumberEnum.THIRD,
      4: WeekNumberEnum.FOURTH,
      5: WeekNumberEnum.FIFTH,
    };

    const weekendRule = await this.weekendRepo.findOne({
      where: [
        {
          day: currentDay,

          weekNumber: WeekNumberEnum.ALL,

          isOff: true,
        },

        {
          day: currentDay,

          weekNumber: weekMap[weekOfMonth],

          isOff: true,
        },
      ],
    });

    // HOLIDAY HAS PRIORITY
    const holiday = await this.holidayRepo.findOne({
      where: {
        date: today,
      },
    });

    if (holiday) {
      return;
    }

    if (!weekendRule) {
      return;
    }

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
      const existing = await this.attendanceRepo.findOne({
        where: {
          employeeId: employee.id,

          date: today,
        },
      });

      if (existing) {
        continue;
      }

      await this.attendanceRepo.save({
        employeeId: employee.id,

        date: today,

        status: AttendanceStatus.WEEKEND,
      });
    }
  }

  // =====================
  // AUTO ABSENT
  // 11:00 PM
  // =====================

  @Cron('02 22 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoMarkAbsent() {
    const today = todayIST();

    const now = nowIST();

    const employees = await this.employeeRepo.find({
      where: {
        isActive: true,

        deletedAt: IsNull(),
      },

      select: {
        id: true,
      },
    });

    // =====================
    // HOLIDAY CHECK
    // =====================

    const holiday = await this.holidayRepo.findOne({
      where: {
        date: today,
      },
    });

    // =====================
    // WEEKEND CHECK
    // =====================

    const dayMap = {
      0: WeekDayEnum.SUNDAY,
      1: WeekDayEnum.MONDAY,
      2: WeekDayEnum.TUESDAY,
      3: WeekDayEnum.WEDNESDAY,
      4: WeekDayEnum.THURSDAY,
      5: WeekDayEnum.FRIDAY,
      6: WeekDayEnum.SATURDAY,
    };

    const currentDay = dayMap[now.day()];

    const weekOfMonth = Math.ceil(now.date() / 7);

    const weekMap = {
      1: WeekNumberEnum.FIRST,
      2: WeekNumberEnum.SECOND,
      3: WeekNumberEnum.THIRD,
      4: WeekNumberEnum.FOURTH,
      5: WeekNumberEnum.FIFTH,
    };

    const weekend = await this.weekendRepo.findOne({
      where: [
        {
          day: currentDay,

          weekNumber: WeekNumberEnum.ALL,

          isOff: true,
        },

        {
          day: currentDay,

          weekNumber: weekMap[weekOfMonth],

          isOff: true,
        },
      ],
    });

    for (const employee of employees) {
      const existingAttendance = await this.attendanceRepo.findOne({
        where: {
          employeeId: employee.id,

          date: today,
        },
      });

      // ATTENDANCE EXISTS
      if (existingAttendance) {
        continue;
      }

      // =====================
      // HOLIDAY
      // =====================

      if (holiday) {
        await this.attendanceRepo.save({
          employeeId: employee.id,

          date: today,

          status: AttendanceStatus.HOLIDAY,
        });

        continue;
      }

      // =====================
      // WEEKEND
      // =====================

      if (weekend) {
        await this.attendanceRepo.save({
          employeeId: employee.id,

          date: today,

          status: AttendanceStatus.WEEKEND,
        });

        continue;
      }

      // =====================
      // LEAVE
      // =====================

      const leave = await this.leaveRepo
        .createQueryBuilder('leave')
        .where(
          `
          leave.employee_id = :employeeId
          `,
          {
            employeeId: employee.id,
          },
        )
        .andWhere(
          `
          leave.status = :status
          `,
          {
            status: LeaveStatusEnum.APPROVED,
          },
        )
        .andWhere(
          `
          leave.start_date <= :today
          AND
          leave.end_date >= :today
          `,
          {
            today,
          },
        )
        .getOne();

      if (leave) {
        await this.attendanceRepo.save({
          employeeId: employee.id,

          date: today,

          status: AttendanceStatus.LEAVE,
        });

        continue;
      }

      // =====================
      // ABSENT
      // =====================

      await this.attendanceRepo.save({
        employeeId: employee.id,

        date: today,

        status: AttendanceStatus.ABSENT,

        workedMinutes: 0,

        overtimeMinutes: 0,
      });
    }

    console.log('AUTO ABSENT COMPLETED');
  }
}
