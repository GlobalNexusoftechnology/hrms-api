import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeEducationService } from './employee-education.service';
import { CreateEmployeeEducationDto } from './dto/create-employee-education.dto';
import { UpdateEmployeeEducationDto } from './dto/update-employee-education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employee Education')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/education')
export class EmployeeEducationController {
  constructor(private readonly educationService: EmployeeEducationService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new educational qualification for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeEducationDto,
  ) {
    return this.educationService.create(employeeId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all educational qualifications for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.educationService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific educational qualification' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.educationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an educational qualification' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeEducationDto,
  ) {
    return this.educationService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an educational qualification' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.educationService.remove(id);
  }
}
