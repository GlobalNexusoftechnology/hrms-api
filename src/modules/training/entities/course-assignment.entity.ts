import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Course } from './course.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('course_assignments')
export class CourseAssignment extends TenantAwareEntity {

  @Column({ name: 'course_id' })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'course_id', referencedColumnName: 'id' },
  ])
  course!: Course;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'numeric', name: 'progress_percentage', default: 0 })
  progressPercentage!: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted!: boolean;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt!: Date;
}
