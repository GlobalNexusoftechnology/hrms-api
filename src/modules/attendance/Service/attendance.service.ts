import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import dayjs from 'dayjs';

import { nowIST, todayIST } from '../../../utils/time.util';

import { Attendance } from '../entities/attendance.entity';

import { AttendanceValidationService } from './attendance-validation.service';

import { calculateAttendanceStatus } from '../helpers/attendance-status.helper';

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
    await this.validationService.validateEmployee(employeeId);

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

      this.validationService.validateCheckIn(attendance);

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

      attendance.status = calculateAttendanceStatus(nowDate);

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
    await this.validationService.validateEmployee(employeeId);

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

      const workedMinutes = Math.floor(now.diff(checkInTime, 'minute'));

      const workedHours = workedMinutes / 60;

      attendance!.workedMinutes = workedMinutes;

      const checkoutValidation = this.validationService.validateEarlyCheckout(
        workedMinutes,

        reason,
      );

      attendance!.earlyCheckoutReason = checkoutValidation.reason;

      attendance!.overtimeMinutes =
        workedMinutes > 480 ? workedMinutes - 480 : 0;

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
