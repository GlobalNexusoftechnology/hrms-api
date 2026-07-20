import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationContactTypeEnum } from '../../../common/enums/organization-contact-type.enum';

export class CreateOrganizationContactDto {
  @ApiProperty({ enum: OrganizationContactTypeEnum, example: OrganizationContactTypeEnum.PRIMARY })
  @IsEnum(OrganizationContactTypeEnum)
  @IsNotEmpty()
  contactType!: OrganizationContactTypeEnum;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+91 8850248290' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}\s?\d{6,14}$/, { message: 'Phone number must include a valid country code' })
  phone!: string;

  @ApiPropertyOptional({ example: 'CEO' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: 'uuid-of-branch' })
  @IsString()
  @IsOptional()
  branchId?: string;
}
