import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { HolidayTypeEnum } from '../../../common/enums/HolidayTypeEnum.enum';

export class CreateHolidayDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsDateString()
  date!: string;

  @IsEnum(HolidayTypeEnum)
  type!: HolidayTypeEnum;

  @IsBoolean()
  isPaid!: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
