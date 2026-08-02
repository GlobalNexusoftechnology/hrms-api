import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConvertCandidateDto {
  @ApiProperty({ description: 'Role ID for the new employee' })
  @IsUUID()
  roleId!: string;

  @ApiProperty({ description: 'Designation ID for the new employee' })
  @IsUUID()
  designationId!: string;

  @ApiProperty({ description: 'Joining Date for the new employee' })
  @IsDateString()
  joiningDate!: Date;

  @ApiPropertyOptional({ description: 'Optional Shift ID for working hours' })
  @IsOptional()
  @IsUUID()
  shiftId!: string;

  @ApiPropertyOptional({ description: 'Optional Branch ID override' })
  @IsOptional()
  @IsUUID()
  branchId!: string;

  @ApiPropertyOptional({ description: 'Optional Department ID override' })
  @IsOptional()
  @IsUUID()
  departmentId!: string;
}
