import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { CourseModule } from './course-module.entity';
import { CourseAssignment } from './course-assignment.entity';

import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('courses')
export class Course extends TenantAwareEntity {

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId!: string | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator!: Employee;

  @OneToMany(() => CourseModule, (module) => module.course)
  modules!: CourseModule[];

  @OneToMany(() => CourseAssignment, (assignment) => assignment.course)
  assignments!: CourseAssignment[];

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

}
