import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../../common/enums/WeekNumberEnum.enum';

export class CreateWeekendDto {
  @IsNotEmpty()
  @IsEnum(WeekDayEnum)
  day!: WeekDayEnum;

  @IsNotEmpty()
  @IsEnum(WeekNumberEnum)
  weekNumber!: WeekNumberEnum;

  @IsBoolean()
  isOff!: boolean;
}
