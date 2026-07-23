import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeBankService } from './employee-bank.service';
import { CreateEmployeeBankDto } from './dto/create-employee-bank.dto';
import { UpdateEmployeeBankDto } from './dto/update-employee-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Employee Bank Details')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees/:employeeId/banks')
export class EmployeeBankController {
  constructor(private readonly bankService: EmployeeBankService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new bank account for an employee' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateEmployeeBankDto,
  ) {
    return this.bankService.create(employeeId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.bankService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific bank account' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeBankDto,
  ) {
    return this.bankService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankService.remove(id);
  }
}
