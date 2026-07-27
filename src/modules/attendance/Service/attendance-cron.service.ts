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
import dayjs from 'dayjs';
import { AttendanceValidationService } from './attendance-validation.service';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../../common/enums/NotificationType.enum';

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
    private readonly validationService: AttendanceValidationService,
    private readonly notificationService: NotificationService,
  ) {}

  // =====================
  // AUTO CHECKOUT
  // HOURLY CHECK
  // =====================

  @Cron('0 * * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoCheckOut() {
    const today = todayIST();
    const now = nowIST();

    console.log('AUTO CHECKOUT HOURLY SCAN RUNNING');

    await this.dataSource.transaction(async (manager) => {
      const records = await manager
        .createQueryBuilder(Attendance, 'attendance')
        .leftJoinAndSelect('attendance.employee', 'employee')
        .leftJoinAndSelect('employee.shift', 'shift')
        .leftJoinAndSelect('employee.branch', 'branch')
        .leftJoinAndSelect('branch.defaultShift', 'branchShift')
        .leftJoinAndSelect('branch.organization', 'organization')
        .leftJoinAndSelect('organization.defaultShift', 'orgShift')
        .setLock('pessimistic_write')
        .where('attendance.check_out IS NULL')
        .andWhere('attendance.check_in IS NOT NULL')
        .andWhere('attendance.status NOT IN (:...excluded)', {
          excluded: [
            AttendanceStatus.HOLIDAY,
            AttendanceStatus.WEEKEND,
            AttendanceStatus.LEAVE,
            AttendanceStatus.ABSENT,
          ],
        })
        .getMany();

      for (const attendance of records) {
        if (!attendance.employee) continue;

        const shift = this.validationService.getEffectiveShift(attendance.employee);
        
        let absoluteMaxTime: dayjs.Dayjs;
        let officialShiftEndTime: dayjs.Dayjs;
        
        if (shift.isFlexible) {
          officialShiftEndTime = dayjs(attendance.checkIn).add(shift.standardWorkingMinutes, 'minute');
        } else {
          const [endHour, endMinute] = shift.endTime.split(':').map(Number);
          officialShiftEndTime = dayjs(attendance.date).hour(endHour).minute(endMinute).second(0).millisecond(0);
          
          if (shift.crossMidnight) {
            // Simplified handling for cross-midnight. If checkin was before midnight and now is after midnight
            // The shift end time belongs to 'tomorrow' relative to the start date.
            if (endHour < 12) {
              officialShiftEndTime = officialShiftEndTime.add(1, 'day');
            }
          }
        }

        absoluteMaxTime = officialShiftEndTime.add(shift.maxAllowedOvertimeMinutes || 240, 'minute');

        // Check if the current time has exceeded their Absolute Max Time
        if (now.isAfter(absoluteMaxTime)) {
          // =====================
          // FORCE AUTO CHECKOUT
          // =====================
          // User chose Option A: Set checkout time to Official Shift End Time (Forfeiting unapproved overtime)
          attendance.checkOut = officialShiftEndTime.toDate();
          attendance.checkOutLocation = 'AUTO';
          attendance.isAutoCheckout = true;

          if (!attendance.earlyCheckoutReason) {
            attendance.earlyCheckoutReason = 'Auto checkout (exceeded max allowed time)';
          }

          let breakMinutes = 0;
          if (!shift.includeBreakInWorkingHours) {
            breakMinutes = shift.totalBreakMinutes || 0;
          }

          const workedMinutes = Math.floor(officialShiftEndTime.diff(dayjs(attendance.checkIn), 'minute')) - breakMinutes;
          attendance.workedMinutes = workedMinutes > 0 ? workedMinutes : 0;
          
          // Overtime is forfeited when forced to auto-checkout
          attendance.overtimeMinutes = 0;

          await manager.save(attendance);
        }
      }
    });

    console.log('AUTO CHECKOUT HOURLY SCAN COMPLETED');
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

  @Cron('0 * * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoMarkAbsent() {
    const today = todayIST();
    const now = nowIST();

    console.log('AUTO ABSENT HOURLY SCAN RUNNING');

    const employees = await this.employeeRepo.find({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
      relations: {
        shift: true,
        branch: {
          defaultShift: true,
          organization: {
            defaultShift: true,
          },
        },
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
      // DYNAMIC ABSENT CHECK
      // =====================
      let shift;
      try {
        shift = this.validationService.getEffectiveShift(employee);
      } catch (e) {
        console.error(`Skipping absent check for employee ${employee.id}: No shift assigned.`);
        continue;
      }

      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      const shiftStartTime = dayjs(today).hour(startHour).minute(startMinute).second(0).millisecond(0);
      const absoluteLatestCheckIn = shiftStartTime.add(shift.latestCheckInMinutes, 'minute');

      // If they still have time to check in, skip them for now
      if (now.isBefore(absoluteLatestCheckIn)) {
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

  // =====================
  // NOTIFY SHIFT END
  // =====================

  @Cron('*/15 * * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async notifyShiftEnd() {
    const today = todayIST();
    const now = nowIST();

    const records = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.shift', 'shift')
      .leftJoinAndSelect('employee.branch', 'branch')
      .leftJoinAndSelect('branch.defaultShift', 'branchShift')
      .leftJoinAndSelect('branch.organization', 'organization')
      .leftJoinAndSelect('organization.defaultShift', 'orgShift')
      .where('attendance.check_out IS NULL')
      .andWhere('attendance.check_in IS NOT NULL')
      .andWhere('attendance.status NOT IN (:...excluded)', {
        excluded: [
          AttendanceStatus.HOLIDAY,
          AttendanceStatus.WEEKEND,
          AttendanceStatus.LEAVE,
          AttendanceStatus.ABSENT,
        ],
      })
      .getMany();

    for (const attendance of records) {
      if (!attendance.employee) continue;

      let shift;
      try {
        shift = this.validationService.getEffectiveShift(attendance.employee);
      } catch (e) {
        continue;
      }

      let officialShiftEndTime: dayjs.Dayjs;
      
      if (shift.isFlexible) {
        officialShiftEndTime = dayjs(attendance.checkIn).add(shift.standardWorkingMinutes, 'minute');
      } else {
        const [endHour, endMinute] = shift.endTime.split(':').map(Number);
        officialShiftEndTime = dayjs(attendance.date).hour(endHour).minute(endMinute).second(0).millisecond(0);
        
        if (shift.crossMidnight && endHour < 12) {
          officialShiftEndTime = officialShiftEndTime.add(1, 'day');
        }
      }

      // Check if shift end time just passed within the last 15 minutes window
      // The 16-minute upper bound ensures that a 15-minute cron job will catch it exactly once
      if (now.isAfter(officialShiftEndTime) && now.isBefore(officialShiftEndTime.add(16, 'minute'))) {
        await this.notificationService.createNotification({
          employeeId: attendance.employee.id,
          type: NotificationType.ATTENDANCE,
          title: `Shift Completed`,
          message: `Your working hours are complete. You can now check out.`,
          referenceId: attendance.id,
        });
      }
    }
  }
}
