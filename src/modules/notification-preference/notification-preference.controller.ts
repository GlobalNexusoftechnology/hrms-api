import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Controller('notification-preference')
export class NotificationPreferenceController {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  

  @Put('preferences')
  updatePreferences(
    @Req() req,
    @Body()
    dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferenceService.updatePreferences(req.user, dto);
  }
}
