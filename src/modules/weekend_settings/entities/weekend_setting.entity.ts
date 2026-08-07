import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../../common/enums/WeekNumberEnum.enum';
import {
  Entity,
  Column,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('weekend_settings')
export class WeekendSetting extends TenantAwareEntity {

  @Column({
    type: 'enum',
    enum: WeekDayEnum,
  })
  day!: WeekDayEnum;

  @Column({
    type: 'enum',
    enum: WeekNumberEnum,
  })
  weekNumber!: WeekNumberEnum;

  @Column({
    default: true,
    name: 'is_off',
  })
  isOff!: boolean;

}
