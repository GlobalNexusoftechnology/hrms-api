import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationAddressType } from '../../../common/enums/organization-address-type.enum';

export class CreateOrganizationAddressDto {
  @ApiProperty({ enum: OrganizationAddressType })
  @IsEnum(OrganizationAddressType)
  @IsNotEmpty()
  addressType!: OrganizationAddressType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
