import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Payload required to bootstrap the system.
 * This will create the very first SUPER_ADMIN user (the Chairman).
 * All other organization details (Company Profile, Address, Tax, etc.)
 * will be created by this Chairman user later using standard protected APIs.
 */
export class BootstrapSystemDto {
  @ApiProperty({ example: 'John', description: 'First name of the Chairman' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the Chairman' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'chairman@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+91 9876543210', description: 'Mobile with country code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}\s?\d{6,14}$/, { message: 'Mobile must include a valid country code (e.g. +91 9876543210)' })
  mobile!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!', description: 'Will be bcrypt-hashed before storage' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
