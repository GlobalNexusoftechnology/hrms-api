import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WeekendSettingsService } from './weekend_settings.service';
import { CreateWeekendDto } from './dto/create-weekend_setting.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance/weekend')
export class WeekendSettingsController {
  constructor(private readonly weekendService: WeekendSettingsService) {}

  @Permissions(PermissionEnum.ATTENDANCE_CREATE)
  @Post()
  create(
    @Body()
    dto: CreateWeekendDto[],
  ) {
    return this.weekendService.create(dto);
  }

  @Permissions(PermissionEnum.ATTENDANCE_READ)
  @Get()
  findAll() {
    return this.weekendService.findAll();
  }

  @Permissions(PermissionEnum.ATTENDANCE_DELETE)
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.weekendService.remove(id);
  }
}
