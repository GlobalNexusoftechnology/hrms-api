import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

@ApiTags('Shift')
@Controller('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @Permissions(PermissionEnum.SHIFT_CREATE)
  @ApiOperation({ summary: 'Create a new shift' })
  create(
    @Body() createShiftDto: CreateShiftDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftService.create(createShiftDto, user?.id);
  }

  @Get()
  @Permissions(PermissionEnum.SHIFT_READ)
  @ApiOperation({ summary: 'Get all shifts for the current tenant' })
  findAll() {
    return this.shiftService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionEnum.SHIFT_READ)
  @ApiOperation({ summary: 'Get a specific shift by ID' })
  findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionEnum.SHIFT_UPDATE)
  @ApiOperation({ summary: 'Update a shift' })
  update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftService.update(id, updateShiftDto, user?.id);
  }

  @Delete(':id')
  @Permissions(PermissionEnum.SHIFT_DELETE)
  @ApiOperation({ summary: 'Delete a shift' })
  remove(@Param('id') id: string) {
    return this.shiftService.remove(id);
  }
}
