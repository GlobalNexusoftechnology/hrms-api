import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import type { Response } from 'express';

import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

import { RolesGuard } from './../../common/guards/roles.guard';

import { Permissions } from './../auth/decorators/permissions.decorator';

import { PermissionEnum } from './../../common/enums/permission.enum';

import { CurrentUser } from './../auth/decorators/current-user.decorator';

import { PayslipService } from './payslip.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('hr/payroll/:id/payslip')
  downloadByHr(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Res()
    res: Response,
  ) {
    return this.payslipService.downloadPayslip(id, res);
  }

  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('payroll/:id/payslip')
  async downloadMyPayslip(
    @Param('id', ParseUUIDPipe)
    id: string,

    @CurrentUser()
    employee: any,

    @Res()
    res: Response,
  ) {
    const isOwner = await this.payslipService.validateOwnership(
      id,
      employee.id,
    );

    if (!isOwner) {
      throw new ForbiddenException('You can only access your own payslip');
    }

    return this.payslipService.downloadPayslip(id, res);
  }
}
