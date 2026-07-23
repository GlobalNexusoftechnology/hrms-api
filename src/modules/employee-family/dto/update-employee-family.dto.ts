import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeFamilyDto } from './create-employee-family.dto';

export class UpdateEmployeeFamilyDto extends PartialType(CreateEmployeeFamilyDto) {}
