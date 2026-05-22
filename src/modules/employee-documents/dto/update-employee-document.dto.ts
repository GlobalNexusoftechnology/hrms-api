import { PartialType } from '@nestjs/swagger';
import { UploadEmployeeDocumentDto } from './upload-employee-document.dto';


export class UpdateEmployeeDocumentDto extends PartialType(UploadEmployeeDocumentDto) {}
