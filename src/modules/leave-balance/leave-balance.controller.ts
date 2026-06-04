import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

UseGuards(JwtAuthGuard, RolesGuard);
@Controller()
export class LeaveBalanceController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Permissions(PermissionEnum.LEAVE_READ)
  @Get('leave-balance/me')
  getMyBalance(
    @CurrentUser()
    employee: any,
  ) {
    return this.leaveBalanceService.getEmployeeBalance(employee.id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.LEAVE_READ)
  @Get('hr/leave-balance')
  getAllBalances(
    @Query()
    query: any,
  ) {
    return this.leaveBalanceService.getAllBalances(query);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.LEAVE_UPDATE)
  @Post('hr/leave-balance/run-credit')
  runMonthlyCredit() {
    return this.leaveBalanceService.creditMonthlyLeave();
  }
}
