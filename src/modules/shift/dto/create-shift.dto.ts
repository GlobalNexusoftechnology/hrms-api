import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Time regex — accepts HH:mm or HH:mm:ss
 * Valid examples: "09:00", "09:00:00", "23:59", "00:00:00"
 */
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
const TIME_MSG = 'must be a valid time in HH:mm or HH:mm:ss format';

export class CreateShiftDto {
  // ─── Identity ────────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'Morning Shift', description: 'Shift name (unique per tenant)' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'MORNING', description: 'Short code (unique per tenant)' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 'Standard 9-to-5 morning shift' })
  @IsOptional()
  @IsString()
  description?: string;

  // ─── Timing ──────────────────────────────────────────────────────────────────

  @ApiProperty({ example: '09:00', description: `Shift start time. ${TIME_MSG}` })
  @IsNotEmpty()
  @IsString()
  @Matches(TIME_REGEX, { message: `startTime ${TIME_MSG}` })
  startTime!: string;

  @ApiProperty({ example: '18:00', description: `Shift end time. ${TIME_MSG}` })
  @IsNotEmpty()
  @IsString()
  @Matches(TIME_REGEX, { message: `endTime ${TIME_MSG}` })
  endTime!: string;

  @ApiPropertyOptional({ example: '13:00', description: `Break start time. ${TIME_MSG}. Send null to clear.` })
  @ValidateIf((o) => o.breakStartTime !== null && o.breakStartTime !== undefined)
  @IsString()
  @Matches(TIME_REGEX, { message: `breakStartTime ${TIME_MSG}` })
  breakStartTime?: string | null;

  @ApiPropertyOptional({ example: '14:00', description: `Break end time. ${TIME_MSG}. Send null to clear.` })
  @ValidateIf((o) => o.breakEndTime !== null && o.breakEndTime !== undefined)
  @IsString()
  @Matches(TIME_REGEX, { message: `breakEndTime ${TIME_MSG}` })
  breakEndTime?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Set true if the shift crosses midnight (e.g. 22:00 – 06:00)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  crossMidnight?: boolean;

  // ─── Working-hour rules ───────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 480, description: 'Standard working minutes per day (default: 480 = 8 hrs)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  standardWorkingMinutes?: number;

  @ApiPropertyOptional({ example: 60, description: 'Total break duration in minutes (auto-calculated if breakStart/End supplied)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBreakMinutes?: number;

  @ApiPropertyOptional({ example: false, description: 'If true, break time is included in working hours calculation' })
  @IsOptional()
  @IsBoolean()
  includeBreakInWorkingHours?: boolean;

  // ─── Grace / threshold rules ─────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 15, description: 'Late arrival grace period in minutes (default: 15)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  lateGraceMinutes?: number;

  @ApiPropertyOptional({ example: 5, description: 'Early departure grace period in minutes (default: 5)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  earlyLeaveGraceMinutes?: number;

  @ApiPropertyOptional({ example: 240, description: 'Minutes worked to count as half-day (default: 240 = 4 hrs)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  halfDayThresholdMinutes?: number;

  // ─── Overtime rules ───────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 480, description: 'Minutes worked before overtime starts (default: 480 = 8 hrs)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  overtimeThresholdMinutes?: number;

  @ApiPropertyOptional({ example: 240, description: 'Maximum overtime allowed per day in minutes (default: 240 = 4 hrs)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAllowedOvertimeMinutes?: number;

  @ApiPropertyOptional({ example: 30, description: 'Minimum minutes of overtime to be recorded (default: 30)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumOvertimeMinutes?: number;

  // ─── Check-in window ─────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 60, description: 'How many minutes before startTime an employee can check in (default: 60)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  earliestCheckInMinutes?: number;

  @ApiPropertyOptional({ example: 240, description: 'How many minutes after startTime is still allowed for check-in (default: 240)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(480)
  latestCheckInMinutes?: number;

  // ─── Flags ───────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: false, description: 'If true, employee can choose flexible check-in/check-out times' })
  @IsOptional()
  @IsBoolean()
  isFlexible?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether this shift is active (default: true)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
