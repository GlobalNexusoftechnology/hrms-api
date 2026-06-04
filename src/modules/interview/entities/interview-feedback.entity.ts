import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Interview } from './interview.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { InterviewRecommendationEnum } from '../../../common/enums/interview-recommendation.enum';

@Entity('interview_feedbacks')
export class InterviewFeedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'interview_id',
  })
  interviewId!: string;

  @ManyToOne(() => Interview, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'interview_id',
  })
  interview!: Interview;

  @Column({
    name: 'created_by',
  })
  createdBy!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({
    name: 'created_by',
  })
  creator!: Employee;

  @Column({
    default: 0,
  })
  rating!: number;

  @Column({
    default: 0,
    name: 'technical_score',
  })
  technicalScore!: number;

  @Column({
    default: 0,
    name: 'communication_score',
  })
  communicationScore!: number;

  @Column({
    nullable: true,
    type: 'text',
  })
  remarks!: string | null;

  @Column({
    type: 'enum',
    enum: InterviewRecommendationEnum,
  })
  recommendation!: InterviewRecommendationEnum;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}
