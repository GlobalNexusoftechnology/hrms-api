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
import { DepartmentsService } from './departments.service';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PermissionEnum } from '../../common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Permissions(PermissionEnum.DEPARTMENT_CREATE)
  @ApiOperation({ summary: 'Create a new department' })
  @Post()
  create(
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(dto);
  }

  @Permissions(PermissionEnum.DEPARTMENT_READ)
  @ApiOperation({ summary: 'Get all departments with optional search and branch filter' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
    @CurrentUser() employee?: any,
  ) {
    return this.departmentsService.findAll(
      Number(page),
      Number(limit),
      search,
      branchId,
      employee,
    );
  }

  @Permissions(PermissionEnum.DEPARTMENT_READ)
  @ApiOperation({ summary: 'Get department by ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() employee?: any,
  ) {
    return this.departmentsService.findOne(id, employee);
  }

  @Permissions(PermissionEnum.DEPARTMENT_UPDATE)
  @ApiOperation({ summary: 'Update a department' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }

  @Permissions(PermissionEnum.DEPARTMENT_DELETE)
  @ApiOperation({ summary: 'Delete a department' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentsService.remove(id);
  }

  @Permissions(PermissionEnum.DEPARTMENT_UPDATE)
  @ApiOperation({ summary: 'Restore a deleted department' })
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentsService.restore(id);
  }
}
