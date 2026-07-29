import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryComponentDto } from './create-salary-component.dto';

export class UpdateSalaryComponentDto extends PartialType(CreateSalaryComponentDto) {}
