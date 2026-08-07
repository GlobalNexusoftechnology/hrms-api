import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SalaryStructure } from './salary-structure.entity';
import { SalaryComponent } from './salary-component.entity';
import { CalculationTypeEnum } from '../../../common/enums/calculation-type.enum';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('salary_structure_components')
@Index(['tenantId', 'salaryStructureId'])
export class SalaryStructureComponent extends TenantAwareEntity {

  @Column({ name: 'salary_structure_id' })
  salaryStructureId!: string;

  @ManyToOne(() => SalaryStructure, (structure) => structure.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'salary_structure_id', referencedColumnName: 'id' },
  ])
  salaryStructure!: SalaryStructure;

  @Column({ name: 'salary_component_id' })
  salaryComponentId!: string;

  @ManyToOne(() => SalaryComponent)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'salary_component_id', referencedColumnName: 'id' },
  ])
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

}
