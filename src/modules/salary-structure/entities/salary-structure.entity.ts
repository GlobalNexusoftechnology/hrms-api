import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { SalaryStructureComponent } from './salary-structure-component.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('salary_structures')
@Index(['tenantId', 'employeeId'])
export class SalaryStructure extends TenantAwareEntity {

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.salaryStructures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    name: 'basic_salary',
  })
  basicSalary!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'gross_salary',
  })
  grossSalary!: number;

  @OneToMany(
    () => SalaryStructureComponent,
    (component) => component.salaryStructure,
    { cascade: true },
  )
  components!: SalaryStructureComponent[];

  @Column({
    type: 'date',

    name: 'effective_from',
  })
  effectiveFrom!: string;

  @Column({
    type: 'date',
    name: 'effective_to',
    nullable: true,
  })
  effectiveTo?: string | null;

  @Column({
    default: true,

    name: 'is_active',
  })
  isActive!: boolean;

}
