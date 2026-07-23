import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeExperienceService } from './employee-experience.service';
import { EmployeeExperienceController } from './employee-experience.controller';
import { EmployeeExperience } from './entities/employee-experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeExperience])],
  controllers: [EmployeeExperienceController],
  providers: [EmployeeExperienceService],
  exports: [EmployeeExperienceService],
})
export class EmployeeExperienceModule {}
