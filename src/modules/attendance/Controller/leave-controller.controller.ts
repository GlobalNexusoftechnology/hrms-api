import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../../common/enums/permission.enum';
import { LeaveService } from '../Service/leave.service';
import { CreateLeaveDto } from '../dto/create-leave.dto';

@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // =====================
  // REQUEST LEAVE
  // =====================

  @Permissions(PermissionEnum.LEAVE_CREATE)
  @Post('request')
  requestLeave(
    @Req()
    req: Request & {
      user: any;
    },

    @Body()
    dto: CreateLeaveDto,
  ) {
    return this.leaveService.requestLeave(req.user.id, dto);
  }

  // =====================
  // MY LEAVES
  // =====================

  @Permissions(PermissionEnum.LEAVE_READ)
  @Get('me')
  getMyLeaves(
    @Req()
    req: Request & {
      user: any;
    },

    @Query('status')
    status?: string,
  ) {
    return this.leaveService.getMyLeaves(req.user.id, status);
  }

  // =====================
  // CANCEL LEAVE
  // =====================

  @Permissions(PermissionEnum.LEAVE_UPDATE)
  @Patch(':id/cancel')
  cancelLeave(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.leaveService.cancelLeave(id, req.user.id);
  }
}
