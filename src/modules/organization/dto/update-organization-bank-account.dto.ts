import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationBankAccountDto } from './create-organization-bank-account.dto';

export class UpdateOrganizationBankAccountDto extends PartialType(CreateOrganizationBankAccountDto) {}
