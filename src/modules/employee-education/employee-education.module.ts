import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEducationService } from './employee-education.service';
import { EmployeeEducationController } from './employee-education.controller';
import { EmployeeEducation } from './entities/employee-education.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEducation])],
  controllers: [EmployeeEducationController],
  providers: [EmployeeEducationService],
  exports: [EmployeeEducationService],
})
export class EmployeeEducationModule {}
