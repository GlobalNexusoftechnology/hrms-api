import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeFamilyService } from './employee-family.service';
import { EmployeeFamilyController } from './employee-family.controller';
import { EmployeeFamily } from './entities/employee-family.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeFamily])],
  controllers: [EmployeeFamilyController],
  providers: [EmployeeFamilyService],
  exports: [EmployeeFamilyService],
})
export class EmployeeFamilyModule {}
