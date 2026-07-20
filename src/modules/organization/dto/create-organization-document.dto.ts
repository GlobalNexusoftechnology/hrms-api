import { IsString, IsEnum, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationDocumentTypeEnum } from '../../../common/enums/organization-document-type.enum';

export class CreateOrganizationDocumentDto {
  @ApiProperty({ enum: OrganizationDocumentTypeEnum, example: OrganizationDocumentTypeEnum.INCORPORATION })
  @IsEnum(OrganizationDocumentTypeEnum)
  @IsNotEmpty()
  documentType!: OrganizationDocumentTypeEnum;

  @ApiProperty({ example: 'Certificate of Incorporation' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'https://storage.com/inc.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @ApiPropertyOptional({ example: 'uuid-of-branch' })
  @IsString()
  @IsOptional()
  branchId?: string;
}
