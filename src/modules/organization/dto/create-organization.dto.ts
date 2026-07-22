import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '../../../common/enums/organization-status.enum';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'ORG-0001' })
  @IsString()
  @IsNotEmpty()
  organizationCode!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Acme Corporation Ltd.' })
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+91 8850248290' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}\s?\d{6,14}$/, { message: 'Phone number must include a valid country code (e.g., +91 8850248290)' })
  phone!: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ enum: OrganizationStatus, default: OrganizationStatus.PENDING })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiPropertyOptional({ example: 'uuid-of-shift' })
  @IsString()
  @IsOptional()
  defaultShiftId?: string;
}
