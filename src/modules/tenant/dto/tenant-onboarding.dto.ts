import { IsString, IsNotEmpty, IsEmail, Matches, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdminUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'admin@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}\s?\d{6,14}$/, {
    message: 'Mobile must include a valid country code (e.g. +91 9876543210)',
  })
  mobile!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class TenantOnboardingDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Name of the company/tenant' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({ example: 'ACME', description: 'Unique code or subdomain for the tenant' })
  @IsString()
  @IsNotEmpty()
  tenantCode!: string;

  @ApiProperty({ description: 'Details of the primary admin user' })
  @ValidateNested()
  @Type(() => AdminUserDto)
  @IsNotEmpty()
  admin!: AdminUserDto;
}
