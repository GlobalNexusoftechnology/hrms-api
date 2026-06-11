import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

@Entity('salary_structures')
export class SalaryStructure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,

    name: 'employee_id',
  })
  employeeId!: string;

  @OneToOne(() => Employee, {
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

    default: 0,
  })
  hra!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  allowance!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  bonus!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  pf!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  esic!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,

    name: 'professional_tax',
  })
  professionalTax!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    name: 'gross_salary',
  })
  grossSalary!: number;

  @Column({
    type: 'decimal',

    precision: 12,

    scale: 2,

    name: 'net_salary',
  })
  netSalary!: number;

  @Column({
    type: 'date',

    name: 'effective_from',
  })
  effectiveFrom!: string;

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
