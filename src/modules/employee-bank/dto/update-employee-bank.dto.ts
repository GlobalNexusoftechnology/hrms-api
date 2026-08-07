import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeBankDto } from './create-employee-bank.dto';

export class UpdateEmployeeBankDto extends PartialType(CreateEmployeeBankDto) {}
