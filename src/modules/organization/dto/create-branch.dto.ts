import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Head Office' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'HQ' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isHeadOffice?: boolean;

  @ApiProperty({ example: '123 Business Rd' })
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @ApiPropertyOptional({ example: 'Suite 100' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'MH' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'uuid-of-employee' })
  @IsString()
  @IsOptional()
  managerId?: string;
}
