import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeSkillService } from './employee-skill.service';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employee Skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/skills')
export class EmployeeSkillController {
  constructor(private readonly skillService: EmployeeSkillService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new skill or certification for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeSkillDto,
  ) {
    return this.skillService.create(employeeId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.skillService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific skill' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a skill' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeSkillDto,
  ) {
    return this.skillService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a skill' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillService.remove(id);
  }
}
