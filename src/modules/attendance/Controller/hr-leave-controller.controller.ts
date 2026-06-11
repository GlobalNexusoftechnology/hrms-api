import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RoleEnum } from '../../../common/enums/role.enum';
import { PermissionEnum } from '../../../common/enums/permission.enum';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';
import { LeaveService } from '../Service/leave.service';

@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr/leave')
export class HrLeaveController {
  constructor(private readonly leaveService: LeaveService) {}


  @Permissions(PermissionEnum.LEAVE_READ)
  @Get()
  findAll(
    @Query()
    query: any,
  ) {
    return this.leaveService.findAll(query);
  }

  @Permissions(PermissionEnum.LEAVE_APPROVAL)
  @Patch(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,

    @Body('comment')
    comment?: string,
  ) {
    return this.leaveService.reviewLeave(
      id,

      LeaveStatusEnum.APPROVED,

      employee.id,

      comment,
    );
  }

  @Permissions(PermissionEnum.LEAVE_APPROVAL)
  @Patch(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,

    @Body('comment')
    comment?: string,
  ) {
    return this.leaveService.reviewLeave(
      id,

      LeaveStatusEnum.REJECTED,

      employee.id,

      comment,
    );
  }

  
}
