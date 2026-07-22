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
  UseGuards,
} from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notification-preference')
export class NotificationPreferenceController {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  @Get('preferences')
  getPreferences(
    @CurrentUser() employee: any,
  ) {
    return this.notificationPreferenceService.getPreferences(employee);
  }

  @Put('preferences')
  updatePreferences(
    @CurrentUser() employee: any,
    @Body()
    dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferenceService.updatePreferences(employee, dto);
  }
}
