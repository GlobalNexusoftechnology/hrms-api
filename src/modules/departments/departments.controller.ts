import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { PermissionEnum } from '../../common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('departments')
@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // @Public()
  @Permissions(PermissionEnum.DEPARTMENT_CREATE)
  @Post()
  create(
    @Body()
    dto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(dto);
  }

  @Permissions(PermissionEnum.DEPARTMENT_READ)
  @Get()
  findAll(
    @Query('page')
    page = '1',

    @Query('limit')
    limit = '10',

    @Query('search')
    search?: string,
  ) {
    return this.departmentsService.findAll(Number(page), Number(limit), search);
  }

  @Permissions(PermissionEnum.DEPARTMENT_READ)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.departmentsService.findOne(id);
  }

  @Permissions(PermissionEnum.DEPARTMENT_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateDepartmentDto,
  ) {
    console.log(dto);

    return this.departmentsService.update(id, dto);
  }

  @Permissions(PermissionEnum.DEPARTMENT_DELETE)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.departmentsService.remove(id);
  }

  @Permissions(PermissionEnum.DEPARTMENT_UPDATE)
  @Patch(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.departmentsService.restore(id);
  }
}
