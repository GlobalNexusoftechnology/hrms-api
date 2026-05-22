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
import { AttendanceService } from '../Service/attendance.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';
import { CorrectionService } from '../Service/correction.service';

@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr/attendance')
export class HrAttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,

    private readonly correctionService: CorrectionService,
  ) {}

  // =====================
  // ALL ATTENDANCE
  // =====================

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get()
  getAll(
    @Query()
    query: any,
  ) {
    return this.attendanceService.getFilteredAttendance(query);
  }

  // =====================
  // APPROVE CORRECTION
  // =====================

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

  // =====================
  // REJECT CORRECTION
  // =====================

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

  // =====================
  // CORRECTION LIST
  // =====================

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
    return this.attendanceService.getHrDashboard();
  }
}
