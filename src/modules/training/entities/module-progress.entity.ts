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
import { Employee } from '../../employees/entities/employee.entity';
import { CourseModule } from './course-module.entity';

@Entity('module_progress')
export class ModuleProgress extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ name: 'module_id' })
  moduleId!: string;

  @ManyToOne(() => CourseModule, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'module_id', referencedColumnName: 'id' },
  ])
  module!: CourseModule;

  @Column({ name: 'is_unlocked', default: false })
  isUnlocked!: boolean;

  @Column({ name: 'is_completed', default: false })
  isCompleted!: boolean;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt!: Date | null;
}
