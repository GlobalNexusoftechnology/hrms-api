import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

import { Interview } from './interview.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { InterviewRecommendationEnum } from '../../../common/enums/interview-recommendation.enum';

@Entity('interview_feedbacks')
@Index(['tenantId', 'interviewId'])
export class InterviewFeedback extends TenantAwareEntity {

  @Column({
    name: 'interview_id',
  })
  interviewId!: string;

  @ManyToOne(() => Interview, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'interview_id', referencedColumnName: 'id' },
  ])
  interview!: Interview;

  @Column({
    name: 'created_by',
  })
  createdBy!: string;

  @ManyToOne(() => Employee)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'created_by', referencedColumnName: 'id' },
  ])
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

}
