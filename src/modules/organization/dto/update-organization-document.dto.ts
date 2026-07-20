import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationDocumentDto } from './create-organization-document.dto';

export class UpdateOrganizationDocumentDto extends PartialType(CreateOrganizationDocumentDto) {}
