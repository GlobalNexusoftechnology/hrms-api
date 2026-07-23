import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeExperienceService } from './employee-experience.service';
import { CreateEmployeeExperienceDto } from './dto/create-employee-experience.dto';
import { UpdateEmployeeExperienceDto } from './dto/update-employee-experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employee Experience')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/experience')
export class EmployeeExperienceController {
  constructor(private readonly experienceService: EmployeeExperienceService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new past experience record for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeExperienceDto,
  ) {
    return this.experienceService.create(employeeId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all experience records for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.experienceService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific experience record' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.experienceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experience record' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeExperienceDto,
  ) {
    return this.experienceService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an experience record' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.experienceService.remove(id);
  }
}
