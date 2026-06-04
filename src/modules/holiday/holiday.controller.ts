import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { HolidayService } from './holiday.service';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance/holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Permissions(PermissionEnum.HOLIDAY_CREATE)
  @Post()
  create(@Body() dto: CreateHolidayDto) {
    return this.holidayService.create(dto);
  }

  @Permissions(PermissionEnum.HOLIDAY_READ)
  @Get()
  findAll(@Query() query: any) {
    return this.holidayService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidayService.findOne(id);
  }

  @Permissions(PermissionEnum.HOLIDAY_UPDATE)
  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateHolidayDto,
  ) {
    return this.holidayService.update(id, dto);
  }

  @Permissions(PermissionEnum.HOLIDAY_DELETE)
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.holidayService.remove(id);
  }
}
