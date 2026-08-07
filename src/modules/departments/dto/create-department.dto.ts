import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering', description: 'Department name (unique per tenant)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ENG', description: 'Department code (unique per tenant)' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Software development and IT operations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Associated branch ID' })
  @IsOptional()
  @IsUUID()
  branchId!: string;
}
