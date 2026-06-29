import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Permissions } from '../../auth/decorators/permissions.decorator';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import { PermissionEnum } from '../../../common/enums/permission.enum';

import { LeaveService } from '../Service/leave.service';

import { CreateLeaveDto } from '../dto/create-leave.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Permissions(PermissionEnum.LEAVE_CREATE)
  @Post('request')
  requestLeave(
    @CurrentUser()
    employee: any,

    @Body()
    dto: CreateLeaveDto,
  ) {
    return this.leaveService.requestLeave(
      employee.id,

      dto,
    );
  }

  @Permissions(PermissionEnum.LEAVE_READ)
  @Get('me')
  getMyLeaves(
    @CurrentUser()
    employee: any,

    @Query('status')
    status?: string,
  ) {
    return this.leaveService.getMyLeaves(
      employee.id,

      status,
    );
  }

  @Permissions(PermissionEnum.LEAVE_UPDATE)
  @Patch(':id/cancel')
  cancelLeave(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,
  ) {
    return this.leaveService.cancelLeave(
      id,

      employee.id,
    );
  }
}
