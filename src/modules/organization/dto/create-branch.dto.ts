import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchType } from '../../../common/enums/branch-type.enum';
import { BranchStatus } from '../../../common/enums/branch-status.enum';

export class CreateBranchDto {
  @ApiProperty({ example: 'Head Office' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'HQ-001', description: 'Will be auto-generated if not provided' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Corporate Head Office' })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({ example: 'Main corporate office' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: BranchType, example: BranchType.HEAD_OFFICE })
  @IsEnum(BranchType)
  @IsNotEmpty()
  branchType!: BranchType;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isHeadOffice!: boolean;

  @ApiPropertyOptional({ example: 'headoffice@company.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Business Rd' })
  @IsString()
  @IsOptional()
  line1?: string;

  @ApiPropertyOptional({ example: 'Suite 100' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'MH' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ enum: BranchStatus, example: BranchStatus.ACTIVE })
  @IsEnum(BranchStatus)
  @IsOptional()
  status?: BranchStatus;

  @ApiPropertyOptional({ example: 'uuid-of-employee' })
  @IsString()
  @IsOptional()
  managerId?: string;
}
