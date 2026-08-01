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
  Index,
} from 'typeorm';

import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Index('unique_designation_name_active', ['tenantId', 'name'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Index('unique_designation_code_active', ['tenantId', 'code'], {
  unique: true,
  where: `"deleted_at" IS NULL`,
})
@Entity('designations')
export class Designation extends TenantAwareEntity {

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({
    name: 'department_id',
  })
  departmentId!: string;

  @ManyToOne(() => Department, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'department_id', referencedColumnName: 'id' },
  ])
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

}
