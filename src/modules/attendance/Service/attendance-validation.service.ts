import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { todayIST } from 'src/utils/time.util';
import { Employee } from '../../employees/entities/employee.entity';
import dayjs from 'dayjs';
import { Attendance } from '../entities/attendance.entity';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { Holiday } from '../../holiday/entities/holiday.entity';
import { WeekendSetting } from '../../weekend_settings/entities/weekend_setting.entity';
import { Leave } from '../entities/leave.entity';
import { WeekNumberEnum } from 'src/common/enums/WeekNumberEnum.enum';
import { WeekDayEnum } from 'src/common/enums/WeekDayEnum.enum';

@Injectable()
export class AttendanceValidationService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,

    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>,

    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,
  ) {}

  // =====================
  // VALIDATE EMPLOYEE
  // =====================

  async validateEmployee(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,

        isActive: true,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  // =====================
  // CHECK-IN VALIDATION
  // =====================

  validateCheckIn(attendance?: Attendance | null) {
    // ALREADY CHECKED IN
    if (attendance?.checkIn) {
      throw new BadRequestException('Already checked in');
    }

    // HOLIDAY / WEEKEND / LEAVE BLOCK
    if (
      attendance?.status === AttendanceStatus.HOLIDAY ||
      attendance?.status === AttendanceStatus.WEEKEND ||
      attendance?.status === AttendanceStatus.LEAVE
    ) {
      throw new BadRequestException(
        `Today is ${attendance.status.toLowerCase().replace('_', ' ')}`,
      );
    }
  }

  // =====================
  // CHECK-OUT VALIDATION
  // =====================

  validateCheckOut(attendance?: Attendance | null) {
    // CHECK-IN REQUIRED
    if (!attendance || !attendance.checkIn) {
      throw new BadRequestException('Check-in not found');
    }

    // ALREADY CHECKED OUT
    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out');
    }
  }

  // =====================
  // EARLY CHECKOUT
  // =====================

  validateEarlyCheckout(workedMinutes: number, reason?: string) {
    const cleanedReason = reason?.trim();

    // < 8 HOURS
    if (workedMinutes < 480) {
      if (!cleanedReason) {
        throw new BadRequestException(
          'Working hours not completed. Please provide reason for early checkout.',
        );
      }

      return {
        isEarly: true,

        reason: cleanedReason,

        message: 'Early checkout recorded',
      };
    }

    return {
      isEarly: false,

      reason: null,

      message: 'Working hours completed. Checkout successful.',
    };
  }

  async validateWorkingDay(employeeId: string) {
    const today = todayIST();

    const now = dayjs(todayIST());

    const holiday = await this.holidayRepo.findOne({
      where: {
        date: today,
      },
    });

    if (holiday) {
      throw new BadRequestException(`Today is holiday (${holiday.name})`);
    }

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

    if (weekend) {
      throw new BadRequestException('Today is weekend');
    }

    // LEAVE
    const leave = await this.leaveRepo
      .createQueryBuilder('leave')
      .where(
        `
        leave.employee_id = :employeeId
      `,
        {
          employeeId,
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
      throw new BadRequestException('Leave approved for today');
    }
  }
}
