import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave-type')
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Post()
  create(@Body() createLeaveTypeDto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(createLeaveTypeDto);
  }

  // Allow all authenticated users to read leave types so they can select them in dropdowns
  @Get()
  findAll() {
    return this.leaveTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.findOne(id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
  ) {
    return this.leaveTypeService.update(id, updateLeaveTypeDto);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.remove(id);
  }
}
