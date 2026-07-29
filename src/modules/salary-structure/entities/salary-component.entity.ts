import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { SalaryComponentTypeEnum } from '../../../common/enums/salary-component-type.enum';
import { CalculationTypeEnum } from '../../../common/enums/calculation-type.enum';
import { PercentageBaseEnum } from '../../../common/enums/percentage-base.enum';

@Entity('salary_components')
export class SalaryComponent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({
    type: 'enum',
    enum: SalaryComponentTypeEnum,
  })
  type!: SalaryComponentTypeEnum;

  @Column({
    type: 'enum',
    enum: CalculationTypeEnum,
    name: 'calculation_type',
  })
  calculationType!: CalculationTypeEnum;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'default_amount',
  })
  defaultAmount!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'percentage_value',
  })
  percentageValue!: number | null;

  @Column({ default: false, name: 'is_mandatory' })
  isMandatory!: boolean;

  @Column({ default: true, name: 'allow_override' })
  allowOverride!: boolean;

  @Column({ default: false, name: 'is_taxable' })
  isTaxable!: boolean;

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder!: number;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ default: false, name: 'is_proratable' })
  isProratable!: boolean;

  @Column({
    type: 'enum',
    enum: PercentageBaseEnum,
    default: PercentageBaseEnum.BASIC,
    nullable: true,
    name: 'percentage_base',
  })
  percentageBase!: PercentageBaseEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
