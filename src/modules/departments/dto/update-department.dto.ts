import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ENG' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Software development and IT operations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
