import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { DesignationsService } from './designations.service';

import { CreateDesignationDto } from './dto/create-designation.dto';

import { UpdateDesignationDto } from './dto/update-designation.dto';

import { Roles } from '../../common/decorators/roles.decorator';

import { RoleEnum } from '../../common/enums/role.enum';

import { PermissionEnum } from '../../common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('designations')
@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Permissions(PermissionEnum.DESIGNATION_CREATE)
  @Post()
  create(
    @Body()
    dto: CreateDesignationDto,
  ) {
    return this.designationsService.create(dto);
  }

  @Permissions(PermissionEnum.DESIGNATION_READ)
  @Get()
  findAll(
    @Query('page')
    page = '1',

    @Query('limit')
    limit = '10',

    @Query('search')
    search?: string,

    @Query('departmentId')
    departmentId?: string,
  ) {
    return this.designationsService.findAll(
      Number(page),
      Number(limit),
      search,
      departmentId,
    );
  }

  @Permissions(PermissionEnum.DESIGNATION_READ)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.designationsService.findOne(id);
  }

  @Permissions(PermissionEnum.DESIGNATION_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateDesignationDto,
  ) {
    return this.designationsService.update(id, dto);
  }

  @Permissions(PermissionEnum.DESIGNATION_DELETE)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.designationsService.remove(id);
  }

  @Permissions(PermissionEnum.DESIGNATION_UPDATE)
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.designationsService.restore(id);
  }
}
