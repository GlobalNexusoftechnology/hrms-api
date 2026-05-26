import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Permissions } from '../../auth/decorators/permissions.decorator';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import { PermissionEnum } from '../../../common/enums/permission.enum';

// SERVICES
import { AttendanceService } from '../Service/attendance.service';

import { AttendanceQueryService } from '../Service/attendance-query.service';

import { AttendanceDashboardService } from '../Service/attendance-dashboard.service';

import { CorrectionService } from '../Service/correction.service';

// DTO
import { CheckInDto } from '../dto/check-In.dto';

import { CheckOutDto } from '../dto/check-out.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,

    private readonly attendanceQueryService: AttendanceQueryService,

    private readonly attendanceDashboardService: AttendanceDashboardService,

    private readonly correctionService: CorrectionService,
  ) {}

  // =====================
  // CHECK-IN
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_CREATE)
  @Post('check-in')
  checkIn(
    @CurrentUser()
    employee: any,

    @Body()
    dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(
      employee.id,

      dto.location,
    );
  }

  // =====================
  // CHECK-OUT
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_CREATE)
  @Post('check-out')
  checkOut(
    @CurrentUser()
    employee: any,

    @Body()
    dto: CheckOutDto,
  ) {
    return this.attendanceService.checkOut(
      employee.id,

      dto.location,

      dto.earlyCheckoutReason,
    );
  }

  // =====================
  // MY ATTENDANCE
  // =====================

  // @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('me')
  getMyAttendance(
    @CurrentUser()
    employee: any,
  ) {
    return this.attendanceQueryService.getMyAttendance(employee.id);
  }

  // =====================
  // FILTER ATTENDANCE
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get()
  getFilteredAttendance(
    @Query()
    query: any,
  ) {
    return this.attendanceQueryService.getFilteredAttendance(query);
  }

  // =====================
  // EMPLOYEE DASHBOARD
  // =====================

  @Permissions(PermissionEnum.EMPLOYEE_DASHBOARD_READ)
  @Get('dashboard')
  getDashboard(
    @CurrentUser()
    employee: any,
  ) {
    return this.attendanceDashboardService.getEmployeeDashboard(employee.id);
  }

  // =====================
  // TODAY ATTENDANCE
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('today')
  getTodayAttendance(
    @Query()
    query: any,
  ) {
    return this.attendanceQueryService.getTodayAttendance(query);
  }

  // =====================
  // ATTENDANCE CALENDAR
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('calendar')
  getAttendanceCalendar(
    @CurrentUser()
    employee: any,

    @Query('month')
    month: number,

    @Query('year')
    year: number,
  ) {
    return this.attendanceQueryService.getAttendanceCalendar(
      employee.id,

      Number(month),

      Number(year),
    );
  }
}
