import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentOption } from './assessment-option.entity';

@Entity('assessment_questions')
export class AssessmentQuestion extends TenantAwareEntity {

  @Column({ name: 'assessment_id' })
  assessmentId!: string;

  @ManyToOne(() => Assessment, (a) => a.questions, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'assessment_id', referencedColumnName: 'id' },
  ])
  assessment!: Assessment;

  @Column({ type: 'text' })
  questionText!: string;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;

  @OneToMany(() => AssessmentOption, (opt) => opt.question)
  options!: AssessmentOption[];
}
