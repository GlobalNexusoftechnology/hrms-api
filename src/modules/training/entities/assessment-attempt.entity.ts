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
import { Assessment } from './assessment.entity';

@Entity('assessment_attempts')
export class AssessmentAttempt extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ name: 'assessment_id' })
  assessmentId!: string;

  @ManyToOne(() => Assessment, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'assessment_id', referencedColumnName: 'id' },
  ])
  assessment!: Assessment;

  @Column({ type: 'numeric', name: 'score_percentage', default: 0 })
  scorePercentage!: number;

  @Column({ name: 'passed', default: false })
  passed!: boolean;

  @CreateDateColumn({ name: 'attempted_at' })
  attemptedAt!: Date;
}
