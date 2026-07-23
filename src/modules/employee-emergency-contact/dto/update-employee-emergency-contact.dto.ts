import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeEmergencyContactDto } from './create-employee-emergency-contact.dto';

export class UpdateEmployeeEmergencyContactDto extends PartialType(CreateEmployeeEmergencyContactDto) {}
