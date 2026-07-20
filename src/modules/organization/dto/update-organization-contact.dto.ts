import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationContactDto } from './create-organization-contact.dto';

export class UpdateOrganizationContactDto extends PartialType(CreateOrganizationContactDto) {}
