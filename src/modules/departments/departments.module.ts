import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';

import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Branch } from '../organization/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Employee, Designation, Branch])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
