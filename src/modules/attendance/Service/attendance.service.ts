import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import dayjs from 'dayjs';

import { nowIST, todayIST } from '../../../utils/time.util';

import { Attendance } from '../entities/attendance.entity';

import { AttendanceValidationService } from './attendance-validation.service';


import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';

import { formatAttendanceResponse } from '../helpers/attendance-response.helper';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    private readonly dataSource: DataSource,

    private readonly validationService: AttendanceValidationService,
  ) {}

  private readonly employeeRelations = {
    employee: {
      department: true,
      designation: true,
    },
  };

  async checkIn(employeeId: string, location?: string) {
    const employee = await this.validationService.validateEmployee(employeeId);

    await this.validationService.validateWorkingDay(employeeId);

    return this.dataSource.transaction(async (manager) => {
      const today = todayIST();

      const now = nowIST();

      const nowDate = now.toDate();

      let attendance = await manager.findOne(Attendance, {
        where: {
          employeeId,

          date: today,
        },

        lock: {
          mode: 'pessimistic_write',
        },
      });

      this.validationService.validateCheckIn(attendance, employee, nowDate);

      if (!attendance) {
        attendance = manager.create(Attendance, {
          employeeId,

          date: today,
        });
      }

      attendance.checkIn = nowDate;

      attendance.checkOut = null;

      attendance.checkInLocation = location?.trim() || null;

      attendance.checkOutLocation = null;

      attendance.earlyCheckoutReason = null;

      attendance.workedMinutes = 0;

      attendance.overtimeMinutes = 0;

      attendance.isAutoCheckout = false;

      const shift = this.validationService.getEffectiveShift(employee);
      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      const shiftStartTime = dayjs(nowDate).hour(startHour).minute(startMinute).second(0).millisecond(0);
      const graceTime = shiftStartTime.add(shift.lateGraceMinutes, 'minute');
      const halfDayTime = shiftStartTime.add(shift.halfDayThresholdMinutes, 'minute');

      const nowDayjs = dayjs(nowDate);

      if (nowDayjs.isAfter(halfDayTime)) {
        attendance.status = AttendanceStatus.HALF_DAY;
        attendance.lateMinutes = nowDayjs.diff(shiftStartTime, 'minute');
      } else if (nowDayjs.isAfter(graceTime)) {
        attendance.status = AttendanceStatus.LATE;
        attendance.lateMinutes = nowDayjs.diff(shiftStartTime, 'minute');
      } else {
        attendance.status = AttendanceStatus.PRESENT;
        attendance.lateMinutes = 0;
      }

      const saved = await manager.save(attendance, {
        reload: true,
      });

      const fullAttendance = await manager.findOne(Attendance, {
        where: {
          id: saved.id,
        },

        relations: this.employeeRelations,
      });

      return formatAttendanceResponse(fullAttendance ?? saved);
    });
  }

  async checkOut(employeeId: string, location?: string, reason?: string) {
    const employee = await this.validationService.validateEmployee(employeeId);

    return this.dataSource.transaction(async (manager) => {
      const today = todayIST();

      const now = nowIST();

      const nowDate = now.toDate();

      const attendance = await manager.findOne(Attendance, {
        where: {
          employeeId,

          date: today,
        },

        lock: {
          mode: 'pessimistic_write',
        },
      });

      this.validationService.validateCheckOut(attendance);

      const checkInTime = dayjs(attendance!.checkIn);

      const shift = this.validationService.getEffectiveShift(employee);

      let breakMinutes = 0;
      if (!shift.includeBreakInWorkingHours) {
        breakMinutes = shift.totalBreakMinutes || 0;
      }

      const workedMinutes = Math.floor(now.diff(checkInTime, 'minute')) - breakMinutes;
      const workedHours = workedMinutes / 60;

      attendance!.workedMinutes = workedMinutes;

      const checkoutValidation = this.validationService.validateEarlyCheckout(
        shift,
        workedMinutes,
        nowDate,
        reason,
      );

      attendance!.earlyCheckoutReason = checkoutValidation.reason;

      // Half-day logic on checkout
      if (workedMinutes < shift.halfDayThresholdMinutes) {
        attendance!.status = AttendanceStatus.HALF_DAY;
      }

      // Overtime Logic
      let overtimeMinutes = 0;
      if (workedMinutes > shift.overtimeThresholdMinutes) {
        const potentialOt = workedMinutes - shift.overtimeThresholdMinutes;
        if (potentialOt >= shift.minimumOvertimeMinutes) {
          overtimeMinutes = potentialOt;
        }
      }
      attendance!.overtimeMinutes = overtimeMinutes;

      attendance!.checkOut = nowDate;

      attendance!.checkOutLocation = location?.trim() || null;

      attendance!.isAutoCheckout = false;

      const saved = await manager.save(attendance!, {
        reload: true,
      });

      const fullAttendance = await manager.findOne(Attendance, {
        where: {
          id: saved.id,
        },

        relations: this.employeeRelations,
      });

      return {
        ...formatAttendanceResponse(fullAttendance ?? saved),

        workedHours: Number(workedHours.toFixed(2)),

        workedMinutes,

        overtimeMinutes: attendance!.overtimeMinutes,

        message: checkoutValidation.message,
      };
    });
  }
}
