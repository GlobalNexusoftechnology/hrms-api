import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { SearchActivityLogDto } from './dto/search-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';
// import { RolesGuard } from '../../common/guards/roles.guard';


@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-log')
@UseGuards(JwtAuthGuard,PermissionsGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Permissions(PermissionEnum.ACTIVITY_LOG_READ,)
  @ApiOperation({ summary: 'Search and filter activity logs' })
  async search(@Query() searchDto: SearchActivityLogDto) {
    return this.activityLogService.searchLogs(searchDto);
  }
}
