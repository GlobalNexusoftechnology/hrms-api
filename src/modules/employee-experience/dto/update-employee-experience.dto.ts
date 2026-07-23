import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeExperienceDto } from './create-employee-experience.dto';

export class UpdateEmployeeExperienceDto extends PartialType(CreateEmployeeExperienceDto) {}
