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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave-type')
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.LEAVE_TYPE_CREATE)
  @Post()
  create(@Body() createLeaveTypeDto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(createLeaveTypeDto);
  }

  // Allow all authenticated users to read leave types so they can select them in dropdowns
  @Permissions(PermissionEnum.LEAVE_TYPE_READ)
  @Get()
  findAll() {
    return this.leaveTypeService.findAll();
  }

  @Permissions(PermissionEnum.LEAVE_TYPE_READ)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.findOne(id);
  }

  @Permissions(PermissionEnum.LEAVE_TYPE_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
  ) {
    return this.leaveTypeService.update(id, updateLeaveTypeDto);
  }

  @Permissions(PermissionEnum.LEAVE_TYPE_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveTypeService.remove(id);
  }
}
