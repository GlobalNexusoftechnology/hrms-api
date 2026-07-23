import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeSkillDto } from './create-employee-skill.dto';

export class UpdateEmployeeSkillDto extends PartialType(CreateEmployeeSkillDto) {}
