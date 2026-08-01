import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { SearchActivityLogDto } from './dto/search-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/entities/employee.entity';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Permissions(PermissionEnum.ACTIVITY_LOG_READ)
  @Get()
  @ApiOperation({ summary: 'Search and filter activity logs' })
  async search(
    @Query() searchDto: SearchActivityLogDto,
    @CurrentUser() currentUser: Employee,
  ) {
    return this.activityLogService.searchLogs(searchDto, currentUser);
  }
}
