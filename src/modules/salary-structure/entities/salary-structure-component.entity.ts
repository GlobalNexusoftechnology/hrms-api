import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalaryStructure } from './salary-structure.entity';
import { SalaryComponent } from './salary-component.entity';
import { CalculationTypeEnum } from '../../../common/enums/calculation-type.enum';

@Entity('salary_structure_components')
export class SalaryStructureComponent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'salary_structure_id' })
  salaryStructureId!: string;

  @ManyToOne(() => SalaryStructure, (structure) => structure.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure!: SalaryStructure;

  @Column({ name: 'salary_component_id' })
  salaryComponentId!: string;

  @ManyToOne(() => SalaryComponent)
  @JoinColumn({ name: 'salary_component_id' })
  salaryComponent!: SalaryComponent;

  @Column({ name: 'component_name' })
  componentName!: string;

  @Column({
    type: 'enum',
    enum: CalculationTypeEnum,
    name: 'calculation_type',
  })
  calculationType!: CalculationTypeEnum;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'percentage_value',
  })
  percentageValue!: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'calculated_amount',
  })
  calculatedAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
