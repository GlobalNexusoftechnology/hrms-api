import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Assessment } from './assessment.entity';

@Entity('assessment_attempts')
export class AssessmentAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'assessment_id' })
  assessmentId!: string;

  @ManyToOne(() => Assessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment!: Assessment;

  @Column({ type: 'numeric', name: 'score_percentage', default: 0 })
  scorePercentage!: number;

  @Column({ name: 'passed', default: false })
  passed!: boolean;

  @CreateDateColumn({ name: 'attempted_at' })
  attemptedAt!: Date;
}