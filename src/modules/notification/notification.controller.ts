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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private notificationPreferenceService: NotificationPreferenceService,
  ) {}

  // Get all notifications
  @Get()
  findAll(
    @Req() req,
    @Query()
    query: NotificationQueryDto,
  ) {
    return this.notificationService.findAll(req.user, query);
  }

  // Preferences
  @Get('preferences')
  getPreferences(@Req() req) {
    return this.notificationPreferenceService.getPreferences(req.user);
  }

  @Put('preferences')
  updatePreferences(
    @Req() req,

    @Body()
    dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferenceService.updatePreferences(req.user, dto);
  }

  // Unread Count
  @Get('unread-count')
  getUnreadCount(@Req() req) {
    return this.notificationService.getUnreadCount(req.user);
  }

  // Mark all read
  @Put('read-all')
  markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(req.user);
  }

  // Dynamic routes LAST
  @Get(':id')
  findOne(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.findOne(id, req.user);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,

    @Req() req,
  ) {
    return this.notificationService.remove(id, req.user);
  }
}
