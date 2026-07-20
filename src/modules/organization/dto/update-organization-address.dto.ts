import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationAddressDto } from './create-organization-address.dto';

export class UpdateOrganizationAddressDto extends PartialType(CreateOrganizationAddressDto) {}
