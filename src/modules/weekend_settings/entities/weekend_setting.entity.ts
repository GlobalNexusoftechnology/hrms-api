import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../../common/enums/WeekNumberEnum.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('weekend_settings')
export class WeekendSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
