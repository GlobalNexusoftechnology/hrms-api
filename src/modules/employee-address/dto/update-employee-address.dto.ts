import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeAddressDto } from './create-employee-address.dto';

export class UpdateEmployeeAddressDto extends PartialType(CreateEmployeeAddressDto) {}
