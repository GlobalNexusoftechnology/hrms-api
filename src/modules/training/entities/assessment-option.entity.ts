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
import { AssessmentQuestion } from './assessment-question.entity';

@Entity('assessment_options')
export class AssessmentOption extends TenantAwareEntity {

  @Column({ name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => AssessmentQuestion, (q) => q.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'question_id', referencedColumnName: 'id' },
  ])
  question!: AssessmentQuestion;

  @Column({ type: 'text' })
  optionText!: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect!: boolean;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;
}
