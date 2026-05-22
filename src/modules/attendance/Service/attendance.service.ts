import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { nowIST, todayIST, formatIST } from 'src/utils/time.util';
import dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { Employee } from '../../employees/entities/employee.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    private dataSource: DataSource,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // ✅ CHECK-IN (transaction safe + time range logic + FIXED locking)
  async checkIn(employeeId: string, location?: string) {
    return this.dataSource.transaction(async (manager) => {
      const today = todayIST();

      const now = nowIST();

      const nowDate = now.toDate();

      // LOCK TODAY RECORD
      let attendance = await manager.findOne(Attendance, {
        where: {
          employeeId,
          date: today,
        },

        lock: {
          mode: 'pessimistic_write',
        },
      });

      // PREVENT DOUBLE CHECK-IN
      if (attendance?.checkIn) {
        throw new BadRequestException('Already checked in');
      }

      // CREATE RECORD IF NOT EXISTS
      if (!attendance) {
        attendance = manager.create(Attendance, {
          employeeId,

          date: today,
        });
      }

      // SAVE CHECK-IN
      attendance.checkIn = nowDate;

      attendance.checkInLocation = location ?? null;

      attendance.checkOut = null;

      attendance.checkOutLocation = null;

      attendance.earlyCheckoutReason = null;

      attendance.isAutoCheckout = false;

      attendance.workedMinutes = 0;

      attendance.overtimeMinutes = 0;

      // =====================
      // ATTENDANCE STATUS
      // =====================

      const presentEnd = now.startOf('day').hour(10).minute(0).second(0);

      const lateEnd = now.startOf('day').hour(12).minute(30).second(0);

      // BEFORE 10:00 AM
      if (now.isBefore(presentEnd)) {
        attendance.status = AttendanceStatus.PRESENT;
      }

      // 11:00 AM - 12:30 PM
      else if (now.isBefore(lateEnd)) {
        attendance.status = AttendanceStatus.LATE;
      }

      // AFTER 12:30 PM
      else {
        attendance.status = AttendanceStatus.HALF_DAY;
      }

      // SAVE
      const saved = await manager.save(attendance, {
        reload: true,
      });

      // FETCH CLEAN RECORD
      const fullAttendance = await manager.findOne(Attendance, {
        where: {
          id: saved.id,
        },
      });

      return this.formatResponse(fullAttendance ?? saved);
    });
  }

  // AUTO CHECKOUT
  // 6:00 PM IST
  @Cron('0 20 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async autoCheckOut() {
    const today = todayIST();

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
        .where('attendance.date = :today', {
          today,
        })
        .andWhere('attendance.check_in IS NOT NULL')
        .andWhere('attendance.check_out IS NULL')
        .getMany();

      for (const attendance of records) {
        if (!attendance.checkIn) {
          continue;
        }

        attendance.checkOut = autoCheckoutTime;

        attendance.checkOutLocation = 'AUTO';

        const workedMinutes = Math.floor(
          (attendance.checkOut.getTime() - attendance.checkIn.getTime()) /
            60000,
        );

        attendance.workedMinutes = workedMinutes;

        attendance.overtimeMinutes =
          workedMinutes > 480 ? workedMinutes - 480 : 0;

        attendance.isAutoCheckout = true;

        attendance.earlyCheckoutReason = 'System auto checkout';

        // OPTIONAL:
        // RECALCULATE STATUS
        if (
          workedMinutes >= 480 &&
          attendance.status === AttendanceStatus.HALF_DAY
        ) {
          attendance.status = AttendanceStatus.PRESENT;
        }

        await manager.save(attendance);
      }
    });
  }

  // CHECK-OUT
  async checkOut(employeeId: string, location?: string, reason?: string) {
    return this.dataSource.transaction(async (manager) => {
      const today = todayIST();

      const now = nowIST();

      const nowDate = now.toDate();

      // LOCK ATTENDANCE
      const attendance = await manager.findOne(Attendance, {
        where: {
          employeeId,
          date: today,
        },

        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!attendance || !attendance.checkIn) {
        throw new BadRequestException('Check-in not found');
      }

      if (attendance.checkOut) {
        throw new BadRequestException('Already checked out');
      }

      // =====================
      // WORK CALCULATION
      // =====================

      const checkInTime = dayjs(attendance.checkIn);

      const workedMinutes = Math.floor(now.diff(checkInTime, 'minute'));

      const workedHours = workedMinutes / 60;

      attendance.workedMinutes = workedMinutes;

      let message: string | null = null;

      // =====================
      // EARLY CHECKOUT
      // =====================

      const cleanedReason = reason?.trim();

      if (workedMinutes < 480) {
        if (!cleanedReason) {
          throw new BadRequestException(
            'Working hours not completed. Please provide reason for early checkout.',
          );
        }

        attendance.earlyCheckoutReason = cleanedReason;

        message = 'Early checkout recorded';
      } else {
        attendance.earlyCheckoutReason = null;

        message = 'Working hours completed. Checkout successful.';
      }

      // =====================
      // STATUS RECALCULATION
      // =====================

      // HALF DAY → PRESENT
      if (
        attendance.status === AttendanceStatus.HALF_DAY &&
        workedMinutes >= 480
      ) {
        attendance.status = AttendanceStatus.PRESENT;
      }

      // OPTIONAL:
      // LATE → PRESENT
      // if (
      //   attendance.status ===
      //     AttendanceStatus.LATE &&
      //   workedMinutes >=
      //     480
      // ) {
      //   attendance.status =
      //     AttendanceStatus.PRESENT;
      // }

      // =====================
      // OVERTIME
      // =====================

      attendance.overtimeMinutes =
        workedMinutes > 480 ? workedMinutes - 480 : 0;

      // =====================
      // SAVE CHECKOUT
      // =====================

      attendance.checkOut = nowDate;

      attendance.checkOutLocation = location ?? null;

      attendance.isAutoCheckout = false;

      const saved = await manager.save(attendance, {
        reload: true,
      });

      const fullAttendance = await manager.findOne(Attendance, {
        where: {
          id: saved.id,
        },
      });

      return {
        ...this.formatResponse(fullAttendance ?? saved),

        workedHours: Number(workedHours.toFixed(2)),

        workedMinutes,

        overtimeMinutes: attendance.overtimeMinutes,

        message,
      };
    });
  }

  // ✅ MY ATTENDANCE (clean + reusable formatting)
  // MY ATTENDANCE
  async getMyAttendance(employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const data = await this.attendanceRepo.find({
      where: {
        employeeId,
      },

      order: {
        date: 'DESC',
      },
    });

    return {
      data: data.map((item) => this.formatResponse(item)),

      total: data.length,
    };
  }

  // ✅ FILTERED QUERY (with employee join + pagination + formatting)
  // FILTER ATTENDANCE
  async getFilteredAttendance(query: any) {
    const {
      date,
      month,
      year,
      employeeId,

      page = 1,
      limit = 10,
    } = query;

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const qb = this.attendanceRepo.createQueryBuilder('attendance');

    qb.leftJoinAndSelect('attendance.employee', 'employee');

    // EMPLOYEE FILTER
    if (employeeId) {
      qb.andWhere('attendance.employee_id = :employeeId', {
        employeeId,
      });
    }

    // EXACT DATE
    if (date) {
      qb.andWhere('attendance.date = :date', {
        date,
      });
    }

    // MONTH + YEAR
    if (month && year) {
      qb.andWhere(
        `
      EXTRACT(
        MONTH
        FROM attendance.date
      ) = :month

      AND

      EXTRACT(
        YEAR
        FROM attendance.date
      ) = :year
      `,
        {
          month: Number(month),

          year: Number(year),
        },
      );
    }

    qb.orderBy('attendance.date', 'DESC');

    qb.skip((pageNumber - 1) * limitNumber);

    qb.take(limitNumber);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => this.formatResponse(item)),

      meta: {
        total,

        page: pageNumber,

        limit: limitNumber,

        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  // CENTRAL FORMATTER
  private formatResponse(attendance: Attendance) {
    return {
      id: attendance.id,

      employeeId: attendance.employeeId,

      employee: attendance.employee
        ? {
            id: attendance.employee.id,

            employeeCode: attendance.employee.employeeCode,

            name: `${attendance.employee.firstName} ${attendance.employee.lastName}`,

            email: attendance.employee.email,
          }
        : null,

      date: attendance.date,

      checkIn: formatIST(attendance.checkIn),

      checkOut: formatIST(attendance.checkOut),

      workedMinutes: attendance.workedMinutes,

      overtimeMinutes: attendance.overtimeMinutes,

      status: attendance.status,

      checkInLocation: attendance.checkInLocation,

      checkOutLocation: attendance.checkOutLocation,

      earlyCheckoutReason: attendance.earlyCheckoutReason,

      isAutoCheckout: attendance.isAutoCheckout,

      createdAt: formatIST(attendance.createdAt),

      updatedAt: formatIST(attendance.updatedAt),
    };
  }

  async getEmployeeDashboard(employeeId: string) {
    const today = todayIST();

    const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');

    const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    // TODAY
    const todayAttendance = await this.attendanceRepo.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    // ALL
    const all = await this.attendanceRepo.find({
      where: {
        employeeId,
      },
    });

    // WEEKLY
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

    // MONTHLY
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
      },

      workingHours: {
        workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),

        expectedHours: all.length * 8,

        completionPercentage: Number(
          ((totalWorkedMinutes / 60 / (all.length * 8)) * 100).toFixed(2),
        ),
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

    // ==========================
    // TOTAL EMPLOYEES
    // ==========================

    const totalEmployees = await this.employeeRepo.count({
      where: {
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    // ==========================
    // TODAY ATTENDANCE
    // ==========================

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

    const absent = totalEmployees - todayAttendance.length;

    // ==========================
    // WEEKLY ATTENDANCE
    // ==========================

    const weeklyAttendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfWeek,

        end: endOfWeek,
      })
      .getMany();

    // ==========================
    // MONTHLY ATTENDANCE
    // ==========================

    const monthlyAttendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :start AND :end', {
        start: startOfMonth,

        end: endOfMonth,
      })
      .getMany();

    // ==========================
    // WORKING HOURS
    // ==========================

    const totalWorkedMinutes = monthlyAttendance.reduce(
      (acc, curr) => acc + (curr.workedMinutes || 0),
      0,
    );

    // ==========================
    // DEPARTMENT STATS
    // ==========================

    const departmentStats = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.employee', 'employee')
      .leftJoin('employee.department', 'department')
      .select('department.name', 'department')
      .addSelect('COUNT(attendance.id)', 'count')
      .where('attendance.date = :today', {
        today,
      })
      .groupBy('department.name')
      .getRawMany();

    // ==========================
    // RESPONSE
    // ==========================

    return {
      employees: {
        total: totalEmployees,

        present,

        late,

        halfDay,

        absent,

        attendancePercentage: Number(
          ((todayAttendance.length / totalEmployees) * 100).toFixed(2),
        ),
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

        present: monthlyAttendance.filter(
          (a) => a.status === AttendanceStatus.PRESENT,
        ).length,

        late: monthlyAttendance.filter(
          (a) => a.status === AttendanceStatus.LATE,
        ).length,

        halfDay: monthlyAttendance.filter(
          (a) => a.status === AttendanceStatus.HALF_DAY,
        ).length,

        workedHours: Number((totalWorkedMinutes / 60).toFixed(2)),
      },

      departmentStats,
    };
  }
}
