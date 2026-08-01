import { HolidayTypeEnum } from '../../../common/enums/HolidayTypeEnum.enum';
import {
  Column,
  Entity,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('holidays')
export class Holiday extends TenantAwareEntity {

  @Column()
  name!: string;

  @Column({
    type: 'date',
  })
  date!: string;

  @Column({
    type: 'enum',
    enum: HolidayTypeEnum,
  })
  type!: HolidayTypeEnum;

  @Column({
    default: true,
  })
  isPaid!: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

}
