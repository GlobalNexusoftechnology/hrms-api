import { IsString, IsEnum, IsInt, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';

export class CreateOrganizationSettingsDto {
  @ApiProperty({ example: 'UTC' })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ example: 'YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  dateFormat!: string;

  @ApiProperty({ example: 'HH:mm' })
  @IsString()
  @IsNotEmpty()
  timeFormat!: string;

  @ApiProperty({ enum: WeekDayEnum, example: WeekDayEnum.MONDAY })
  @IsEnum(WeekDayEnum)
  @IsNotEmpty()
  weekStartDay!: WeekDayEnum;

  @ApiProperty({ description: 'Month number (1-12)', minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  financialYearStartMonth!: number;

  @ApiProperty({ description: 'Default notice period in days for resignations', example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  noticePeriodDays?: number;
}
