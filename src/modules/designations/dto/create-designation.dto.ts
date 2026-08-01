import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({ example: 'Senior Software Engineer', description: 'Designation name (unique per tenant)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'SR_SE', description: 'Designation code (unique per tenant)' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Associated Department ID' })
  @IsUUID()
  departmentId!: string;

  @ApiPropertyOptional({ example: 'Senior developer leading core features' })
  @IsOptional()
  @IsString()
  description?: string;
}
