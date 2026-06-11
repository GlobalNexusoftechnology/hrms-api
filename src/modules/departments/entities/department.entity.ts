import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { Designation } from '../../designations/entities/designation.entity';

@Index('unique_department_name_active', ['name'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Index('unique_department_code_active', ['code'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  code!: string;

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

  @OneToMany(() => Employee, (employee) => employee.department)
  employees!: Employee[];

  @OneToMany(() => Designation, (designation) => designation.department)
  designations!: Designation[];

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
