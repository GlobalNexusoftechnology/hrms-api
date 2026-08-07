import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SalaryStructure } from './entities/salary-structure.entity';
import { SalaryStructureComponent } from './entities/salary-structure-component.entity';
import { SalaryComponent } from './entities/salary-component.entity';

import { Employee } from '../employees/entities/employee.entity';
import { SalaryStructureController } from './salary-structure.controller';
import { SalaryStructureService } from './salary-structure.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaryStructure,
      SalaryStructureComponent,
      SalaryComponent,
      Employee,
    ]),
  ],

  controllers: [SalaryStructureController],

  providers: [SalaryStructureService],

  exports: [SalaryStructureService],
})
export class SalaryStructureModule {}
