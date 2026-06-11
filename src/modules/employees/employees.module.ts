import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Role } from '../roles/entities/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Department, Designation, Role,RefreshToken]),
  ],

  controllers: [EmployeesController],

  providers: [EmployeesService],

  exports: [EmployeesService, TypeOrmModule],
})
export class EmployeesModule {}
