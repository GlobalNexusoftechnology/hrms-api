import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { Request } from 'express';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RoleEnum } from '../../../common/enums/role.enum';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { LeaveService } from '../Service/leave.service';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr/leave')
export class HrLeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // =====================
  // ALL LEAVES
  // =====================

  @Permissions(PermissionEnum.LEAVE_READ)
  @Get()
  findAll(
    @Query()
    query: any,
  ) {
    return this.leaveService.findAll(query);
  }

  // =====================
  // APPROVE
  // =====================

  @Permissions(PermissionEnum.LEAVE_UPDATE)
  @Patch(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },

    @Body('comment')
    comment?: string,
  ) {
    return this.leaveService.reviewLeave(
      id,

      LeaveStatusEnum.APPROVED,

      req.user.id,

      comment,
    );
  }

  // =====================
  // REJECT
  // =====================

  @Permissions(PermissionEnum.LEAVE_UPDATE)
  @Patch(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },

    @Body('comment')
    comment?: string,
  ) {
    return this.leaveService.reviewLeave(
      id,
      LeaveStatusEnum.REJECTED,
      req.user.id,
      comment,
    );
  }
}
