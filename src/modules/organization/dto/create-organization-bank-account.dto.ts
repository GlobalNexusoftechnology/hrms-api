import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationBankAccountDto {
  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: 'Acme Corp Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @ApiProperty({ example: '50200012345678' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  @IsNotEmpty()
  ifscCode!: string;

  @ApiPropertyOptional({ example: 'Bandra West' })
  @IsString()
  @IsOptional()
  branchName?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'uuid-of-branch' })
  @IsString()
  @IsOptional()
  branchId?: string;
}
