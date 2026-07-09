import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AssessmentQuestion } from './assessment-question.entity';

@Entity('assessment_options')
export class AssessmentOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => AssessmentQuestion, q => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: AssessmentQuestion;

  @Column({ type: 'text' })
  optionText!: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect!: boolean;

  @Column({ name: 'sort_order', default: 1 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}