import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SalaryStructure } from './entities/salary-structure.entity';

import { Employee } from '../employees/entities/employee.entity';
import { SalaryStructureController } from './salary-structure.controller';
import { SalaryStructureService } from './salary-structure.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalaryStructure, Employee])],

  controllers: [SalaryStructureController],

  providers: [SalaryStructureService],

  exports: [SalaryStructureService],
})
export class SalaryStructureModule {}
