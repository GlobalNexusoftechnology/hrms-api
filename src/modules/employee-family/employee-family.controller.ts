import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeFamilyService } from './employee-family.service';
import { CreateEmployeeFamilyDto } from './dto/create-employee-family.dto';
import { UpdateEmployeeFamilyDto } from './dto/update-employee-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@ApiTags('Employee Family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/family')
export class EmployeeFamilyController {
  constructor(private readonly familyService: EmployeeFamilyService) {}

  @Permissions(PermissionEnum.EMPLOYEE_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a new family member for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeFamilyDto,
  ) {
    return this.familyService.create(employeeId, createDto);
  }

  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get()
  @ApiOperation({ summary: 'Get all family members for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.familyService.findAllByEmployee(employeeId);
  }

  @Permissions(PermissionEnum.EMPLOYEE_READ)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific family member' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.familyService.findOne(id);
  }

  @Permissions(PermissionEnum.EMPLOYEE_UPDATE)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a family member' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeFamilyDto,
  ) {
    return this.familyService.update(id, updateDto);
  }

  @Permissions(PermissionEnum.EMPLOYEE_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a family member' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.familyService.remove(id);
  }
}
