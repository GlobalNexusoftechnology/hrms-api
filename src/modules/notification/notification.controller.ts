import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { NotificationService } from './notification.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdateNotificationPreferenceDto } from '../notification-preference/dto/update-notification-preference.dto';
import { NotificationPreferenceService } from '../notification-preference/notification-preference.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private notificationPreferenceService: NotificationPreferenceService,
  ) {}

  // Get all notifications
  @Permissions(PermissionEnum.NOTIFICATION_READ)
  @Get()
  findAll(
    @Req() req,
    @Query()
    query: NotificationQueryDto,
  ) {
    return this.notificationService.findAll(req.user, query);
  }

  // Preferences
  @Permissions(PermissionEnum.NOTIFICATION_SETTINGS_READ)
  @Get('preferences')
  getPreferences(@Req() req) {
    return this.notificationPreferenceService.getPreferences(req.user);
  }

  @Permissions(PermissionEnum.NOTIFICATION_SETTINGS_UPDATE)
  @Put('preferences')
  updatePreferences(
    @Req() req,

    @Body()
    dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferenceService.updatePreferences(req.user, dto);
  }

  // Unread Count
  @Permissions(PermissionEnum.NOTIFICATION_READ)
  @Get('unread-count')
  getUnreadCount(@Req() req) {
    return this.notificationService.getUnreadCount(req.user);
  }

  // Mark all read
  @Permissions(PermissionEnum.NOTIFICATION_UPDATE)
  @Put('read-all')
  markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(req.user);
  }

  // Dynamic routes LAST
  @Permissions(PermissionEnum.NOTIFICATION_READ)
  @Get(':id')
  findOne(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.findOne(id, req.user);
  }

  @Permissions(PermissionEnum.NOTIFICATION_UPDATE)
  @Put(':id/read')
  markAsRead(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @Permissions(PermissionEnum.NOTIFICATION_DELETE)
  @Delete(':id')
  remove(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.remove(id, req.user);
  }
}
