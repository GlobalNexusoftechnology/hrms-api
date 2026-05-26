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
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SalaryStructureController {
  constructor(private readonly salaryService: SalaryStructureService) {}

  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('salary-structure/me')
  getMySalary(
    @CurrentUser()
    employee: any,
  ) {
    return this.salaryService.getMySalaryStructure(employee.id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_CREATE)
  @Post('hr/salary-structure')
  create(
    @Body()
    dto: CreateSalaryStructureDto,
  ) {
    return this.salaryService.create(dto);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_UPDATE)
  @Patch('hr/salary-structure/:id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateSalaryStructureDto,
  ) {
    return this.salaryService.update(id, dto);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_ALL_READ)
  @Get('hr/salary-structure')
  findAll(
    @Query()
    query: any,
  ) {
    return this.salaryService.findAll(query);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.PAYROLL_READ)
  @Get('hr/salary-structure/:id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.salaryService.findOne(id);
  }
}
