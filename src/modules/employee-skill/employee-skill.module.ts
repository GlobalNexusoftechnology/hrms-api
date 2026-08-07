import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSkillService } from './employee-skill.service';
import { EmployeeSkillController } from './employee-skill.controller';
import { EmployeeSkill } from './entities/employee-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeSkill])],
  controllers: [EmployeeSkillController],
  providers: [EmployeeSkillService],
  exports: [EmployeeSkillService],
})
export class EmployeeSkillModule {}
