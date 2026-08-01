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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

import { PermissionEnum } from '../../common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Designations')
@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Permissions(PermissionEnum.DESIGNATION_CREATE)
  @ApiOperation({ summary: 'Create a new designation' })
  @Post()
  create(
    @Body() dto: CreateDesignationDto,
  ) {
    return this.designationsService.create(dto);
  }

  @Permissions(PermissionEnum.DESIGNATION_READ)
  @ApiOperation({ summary: 'Get all designations with optional search, departmentId, and branchId filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() employee?: any,
  ) {
    return this.designationsService.findAll(
      Number(page),
      Number(limit),
      search,
      departmentId,
      branchId,
      employee,
    );
  }

  @Permissions(PermissionEnum.DESIGNATION_READ)
  @ApiOperation({ summary: 'Get designation by ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.designationsService.findOne(id);
  }

  @Permissions(PermissionEnum.DESIGNATION_UPDATE)
  @ApiOperation({ summary: 'Update a designation' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.designationsService.update(id, dto);
  }

  @Permissions(PermissionEnum.DESIGNATION_DELETE)
  @ApiOperation({ summary: 'Delete a designation' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.designationsService.remove(id);
  }

  @Permissions(PermissionEnum.DESIGNATION_UPDATE)
  @ApiOperation({ summary: 'Restore a deleted designation' })
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.designationsService.restore(id);
  }
}
