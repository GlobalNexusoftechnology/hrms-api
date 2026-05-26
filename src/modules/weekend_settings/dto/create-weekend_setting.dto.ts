import { IsBoolean, IsEnum } from 'class-validator';
import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../../common/enums/WeekNumberEnum.enum';

export class CreateWeekendDto {
  @IsEnum(WeekDayEnum)
  day!: WeekDayEnum;

  @IsEnum(WeekNumberEnum)
  weekNumber!: WeekNumberEnum;

  @IsBoolean()
  isOff!: boolean;
}
