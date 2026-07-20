import { IsString, IsNotEmpty, ValidateNested, IsEmail, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrganizationDto } from '../../organization/dto/create-organization.dto';
import { CreateOrganizationAddressDto } from '../../organization/dto/create-organization-address.dto';
import { CreateOrganizationTaxDto } from '../../organization/dto/create-organization-tax.dto';
import { CreateOrganizationSettingsDto } from '../../organization/dto/create-organization-settings.dto';
import { CreateBranchDto } from '../../organization/dto/create-branch.dto';

export class AdminUserBootstrapDto {
  @ApiProperty({ example: 'Admin User' })
  @IsString() @IsNotEmpty() name!: string;

  @ApiProperty({ example: 'admin@company.com' })
  @IsEmail() @IsNotEmpty() email!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString() @IsNotEmpty() password!: string;
}

export class BootstrapSystemDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  organization!: CreateOrganizationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateOrganizationAddressDto)
  address!: CreateOrganizationAddressDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateOrganizationTaxDto)
  tax!: CreateOrganizationTaxDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateOrganizationSettingsDto)
  settings!: CreateOrganizationSettingsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateBranchDto)
  headOffice!: CreateBranchDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AdminUserBootstrapDto)
  adminUser!: AdminUserBootstrapDto;
}
