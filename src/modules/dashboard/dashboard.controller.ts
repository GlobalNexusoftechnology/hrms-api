import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @CurrentUser()
    user: any,
  ) {
    const role = user.role?.name;

    switch (role) {
      case 'SUPER_ADMIN':
        return this.dashboardService.getSuperAdminDashboard();

      case 'HR':
        return this.dashboardService.getHrDashboard();

      case 'EMPLOYEE':
        return this.dashboardService.getEmployeeDashboard(user.id);

      default:
        throw new Error('Invalid role');
    }
  }
}
