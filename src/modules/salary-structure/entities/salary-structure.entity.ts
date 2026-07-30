import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { SalaryStructureComponent } from './salary-structure-component.entity';

@Entity('salary_structures')
export class SalaryStructure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.salaryStructures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
