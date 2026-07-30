import { Controller, Get } from '@nestjs/common';
import { DataScopeEnum } from '../../common/enums/data-scope.enum';

import { DashboardService } from './dashboard.service';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('me')
  async getMyDashboard(
    @CurrentUser()
    user: any,
  ) {
    return this.dashboardService.getEmployeeDashboard(user.id);
  }

  @Get()
  async getDashboard(
    @CurrentUser()
    user: any,
  ) {
    const scope = user.role?.dataScope;
    const permissions = user.role?.permissions?.map((p: any) => p.name) || [];

    if (
      scope === DataScopeEnum.ORGANIZATION ||
      permissions.includes('admin_dashboard.read')
    ) {
      return this.dashboardService.getSuperAdminDashboard();
    }

    if (
      scope === DataScopeEnum.BRANCH ||
      scope === DataScopeEnum.DEPARTMENT ||
      permissions.includes('hr_dashboard.read')
    ) {
      return this.dashboardService.getHrDashboard(user);
    }

    // Default to the standard employee dashboard for custom roles like Branch Manager
    return this.dashboardService.getEmployeeDashboard(user.id);
  }
}
