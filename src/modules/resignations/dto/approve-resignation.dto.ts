import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveResignationDto {
  @ApiPropertyOptional({
    description: 'Optional override for the last working date in ISO format',
  })
  @IsOptional()
  @IsDateString()
  approvedLastWorkingDate?: string;

  @ApiPropertyOptional({
    description: 'Reason for overriding notice period or other HR remarks',
  })
  @IsOptional()
  @IsString()
  shortfallReason?: string;
}
