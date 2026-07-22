import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'startTime must be a valid time in HH:mm or HH:mm:ss format',
  })
  startTime!: string;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'endTime must be a valid time in HH:mm or HH:mm:ss format',
  })
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  crossMidnight?: boolean;

  @IsOptional()
  @IsInt()
  standardWorkingMinutes?: number;

  @IsOptional()
  @IsInt()
  totalBreakMinutes?: number;

  @IsOptional()
  @IsBoolean()
  includeBreakInWorkingHours?: boolean;

  @IsOptional()
  @IsInt()
  lateGraceMinutes?: number;

  @IsOptional()
  @IsInt()
  earlyLeaveGraceMinutes?: number;

  @IsOptional()
  @IsInt()
  halfDayThresholdMinutes?: number;

  @IsOptional()
  @IsInt()
  overtimeThresholdMinutes?: number;

  @IsOptional()
  @IsInt()
  minimumOvertimeMinutes?: number;

  @IsOptional()
  @IsInt()
  earliestCheckInMinutes?: number;

  @IsOptional()
  @IsInt()
  latestCheckInMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isFlexible?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
