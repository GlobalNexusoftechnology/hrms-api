import { IsOptional, IsNumberString } from 'class-validator';

export class FilterAttendanceDto {
  @IsOptional()
  date?: string;

  @IsOptional()
  @IsNumberString()
  month?: string;

  @IsOptional()
  @IsNumberString()
  year?: string;

  @IsOptional()
  employeeId?: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
