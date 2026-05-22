import { IsEnum } from 'class-validator';

import { DocumentTypeEnum } from '../../../common/enums/document-type.enum';

export class UploadEmployeeDocumentDto {
  @IsEnum(DocumentTypeEnum)
  documentType!: DocumentTypeEnum;
}
