import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeFamilyService } from './employee-family.service';
import { CreateEmployeeFamilyDto } from './dto/create-employee-family.dto';
import { UpdateEmployeeFamilyDto } from './dto/update-employee-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employee Family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/family')
export class EmployeeFamilyController {
  constructor(private readonly familyService: EmployeeFamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family member for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeFamilyDto,
  ) {
    return this.familyService.create(employeeId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all family members for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.familyService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific family member' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.familyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a family member' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeFamilyDto,
  ) {
    return this.familyService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a family member' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.familyService.remove(id);
  }
}
