import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { CourseModule } from './course-module.entity';
import { CourseAssignment } from './course-assignment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToMany(() => CourseModule, module => module.course)
  modules!: CourseModule[];

  @OneToMany(() => CourseAssignment, assignment => assignment.course)
  assignments!: CourseAssignment[];

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}