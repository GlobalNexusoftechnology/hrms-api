import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleEnum } from '../../../common/enums/role.enum';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../../common/enums/permission.enum';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';
import { AttendanceQueryService } from '../Service/attendance-query.service';
import { AttendanceDashboardService } from '../Service/attendance-dashboard.service';
import { CorrectionService } from '../Service/correction.service';

@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr/attendance')
export class HrAttendanceController {
  constructor(
    private readonly attendanceQueryService: AttendanceQueryService,

    private readonly attendanceDashboardService: AttendanceDashboardService,

    private readonly correctionService: CorrectionService,
  ) {}

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get()
  getAll(
    @Query()
    query: any,
  ) {
    return this.attendanceQueryService.getFilteredAttendance(query);
  }

  @Permissions(PermissionEnum.ATTENDANCE_CORRECTION_UPDATE)
  @Patch('correction/:id/approve')
  approve(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,
  ) {
    return this.correctionService.review(
      id,

      CorrectionStatus.APPROVED,

      employee.id,
    );
  }

  @Permissions(PermissionEnum.ATTENDANCE_CORRECTION_UPDATE)
  @Patch('correction/:id/reject')
  reject(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,
  ) {
    return this.correctionService.review(
      id,

      CorrectionStatus.REJECTED,

      employee.id,
    );
  }

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('corrections')
  getCorrections(
    @Query()
    query: any,
  ) {
    return this.correctionService.findAll(query);
  }

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('dashboard')
  getDashboard() {
    return this.attendanceDashboardService.getHrDashboard();
  }

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get('today')
  getTodayAttendance(
    @Query()
    query: any,
  ) {
    return this.attendanceQueryService.getTodayAttendance(query);
  }
}
