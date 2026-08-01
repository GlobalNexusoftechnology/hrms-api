import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SalaryStructureService } from './salary-structure.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SalaryStructureController {
  constructor(private readonly salaryService: SalaryStructureService) {}

  @Permissions(PermissionEnum.SALARY_READ)
  @Get('salary-structure/me')
  getMySalary(
    @CurrentUser()
    employee: any,
  ) {
    return this.salaryService.getMySalaryStructure(employee.id);
  }

  // =====================
  // SALARY COMPONENTS
  // =====================

  @Permissions(PermissionEnum.SALARY_CREATE)
  @Post('hr/salary-components')
  createComponent(
    @Body()
    dto: CreateSalaryComponentDto,
  ) {
    return this.salaryService.createComponent(dto);
  }

  @Permissions(PermissionEnum.SALARY_UPDATE)
  @Patch('hr/salary-components/:id')
  updateComponent(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: UpdateSalaryComponentDto,
  ) {
    return this.salaryService.updateComponent(id, dto);
  }

  @Permissions(PermissionEnum.SALARY_READ)
  @Get('hr/salary-components')
  getComponents(
    @Query('organizationId', ParseUUIDPipe)
    organizationId: string,
  ) {
    return this.salaryService.getComponents(organizationId);
  }

  // =====================
  // SALARY STRUCTURE
  // =====================

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.SALARY_CREATE)
  @Post('hr/salary-structure')
  create(
    @Body()
    dto: CreateSalaryStructureDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.salaryService.create(dto, currentUser);
  }

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.SALARY_UPDATE)
  @Patch('hr/salary-structure/:id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateSalaryStructureDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.salaryService.update(id, dto, currentUser);
  }

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.SALARY_READ)
  @Get('hr/salary-structure')
  findAll(
    @Query()
    query: any,
    @CurrentUser() currentUser: any,
  ) {
    return this.salaryService.findAll(query, currentUser);
  }

  // @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.SALARY_READ)
  @Get('hr/salary-structure/:id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.salaryService.findOne(id, currentUser);
  }
}
