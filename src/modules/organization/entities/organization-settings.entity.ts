import { Entity, Column, OneToOne, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { WeekDayEnum } from '../../../common/enums/WeekDayEnum.enum';

@Entity('organization_settings')
@Check('"financial_year_start_month" BETWEEN 1 AND 12')
export class OrganizationSettings extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column()
  timezone!: string;

  @Column()
  currency!: string;

  @Column()
  language!: string;

  @Column({ name: 'date_format' })
  dateFormat!: string;

  @Column({ name: 'time_format' })
  timeFormat!: string;

  @Column({ name: 'week_start_day', type: 'enum', enum: WeekDayEnum, default: WeekDayEnum.MONDAY })
  weekStartDay!: WeekDayEnum;

  @Column({ name: 'financial_year_start_month', type: 'int' })
  financialYearStartMonth!: number;

  @OneToOne(() => Organization, (org) => org.settings)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
