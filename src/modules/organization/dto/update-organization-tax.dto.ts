import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationTaxDto } from './create-organization-tax.dto';

export class UpdateOrganizationTaxDto extends PartialType(CreateOrganizationTaxDto) {}
