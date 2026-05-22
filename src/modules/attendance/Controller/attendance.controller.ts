import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { AttendanceService } from '../Service/attendance.service';

import { CheckOutDto } from '../dto/check-out.dto';

import { Permissions } from '../../auth/decorators/permissions.decorator';

import { PermissionEnum } from '../../../common/enums/permission.enum';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CheckInDto } from '../dto/check-In.dto';
import { CorrectionService } from '../Service/correction.service';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly correctionService: CorrectionService,
  ) {}

  // CHECK-IN
  @Permissions(PermissionEnum.ATTENDANCE_CREATE)
  @Post('check-in')
  checkIn(
    @CurrentUser()
    employee: any,

    @Body()
    dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(employee.id, dto.location);
  }

  // CHECK-OUT
  @Permissions(PermissionEnum.ATTENDANCE_UPDATE)
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

  // MY ATTENDANCE
  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('me')
  getMyAttendance(
    @CurrentUser()
    employee: any,
  ) {
    return this.attendanceService.getMyAttendance(employee.id);
  }

  // FILTER
  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get()
  getFilteredAttendance(
    @Query()
    query: any,
  ) {
    return this.attendanceService.getFilteredAttendance(query);
  }

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('dashboard')
  getDashboard(
    @CurrentUser()
    employee: any,
  ) {
    return this.attendanceService.getEmployeeDashboard(employee.id);
  }
}
