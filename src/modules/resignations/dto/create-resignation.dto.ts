import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResignationDto {
  @ApiProperty({ description: 'The requested last working date in ISO format' })
  @IsNotEmpty()
  @IsDateString()
  requestedLastWorkingDate!: string;

  @ApiProperty({ description: 'Reason for resignation' })
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Additional remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
