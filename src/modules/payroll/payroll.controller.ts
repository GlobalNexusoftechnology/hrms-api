import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

import { RolesGuard } from './../../common/guards/roles.guard';

import { Roles } from './../../common/decorators/roles.decorator';

import { CurrentUser } from './../auth/decorators/current-user.decorator';

import { Permissions } from './../auth/decorators/permissions.decorator';

import { PermissionEnum } from './../../common/enums/permission.enum';

import { RoleEnum } from './../../common/enums/role.enum';
import { PayrollService } from './payroll.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('payroll/me')
  getMyPayroll(
    @CurrentUser()
    employee: any,
  ) {
    return this.payrollService.getMyPayroll(employee.id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_CREATE)
  @Post('hr/payroll/generate')
  generate(
    @Body()
    body: {
      employeeId: string;
      month: number;
      year: number;
    },
  ) {
    return this.payrollService.generatePayroll(
      body.employeeId,

      body.month,

      body.year,
    );
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('hr/payroll')
  findAll(
    @Query()
    query: any,
  ) {
    return this.payrollService.findAll(query);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_UPDATE)
  @Patch('hr/payroll/:id/pay')
  markPaid(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.payrollService.markAsPaid(id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_UPDATE)
  @Post('hr/payroll/pay-all')
  payAll(
    @Body()
    body: {
      month: number;
      year: number;
    },
  ) {
    return this.payrollService.payAll(body.month, body.year);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_CREATE)
  @Post('hr/payroll/generate-all')
  generateAll(
    @Body()
    body: {
      month: number;

      year: number;
    },
  ) {
    return this.payrollService.generateAllPayroll(
      body.month,

      body.year,
    );
  }
}
