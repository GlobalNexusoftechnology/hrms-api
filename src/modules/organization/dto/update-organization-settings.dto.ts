import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationSettingsDto } from './create-organization-settings.dto';

export class UpdateOrganizationSettingsDto extends PartialType(CreateOrganizationSettingsDto) {}
