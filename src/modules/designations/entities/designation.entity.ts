import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Department } from '../../departments/entities/department.entity';

import { Employee } from '../../employees/entities/employee.entity';

@Entity('designations')
export class Designation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    unique: true,
  })
  code!: string;

  @Column({
    name: 'department_id',
  })
  departmentId!: string;

  @ManyToOne(() => Department, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'department_id',
  })
  department!: Department;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @OneToMany(() => Employee, (employee) => employee.designation)
  employees!: Employee[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt!: Date;
}
