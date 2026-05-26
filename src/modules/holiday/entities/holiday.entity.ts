import { HolidayTypeEnum } from '../../../common/enums/HolidayTypeEnum.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
