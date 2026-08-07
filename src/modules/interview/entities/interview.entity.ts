import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

import { CandidateApplication } from './candidate-application.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { InterviewStatusEnum } from '../../../common/enums/interview-status.enum';
import { InterviewFeedback } from './interview-feedback.entity';
import { InterviewRoundEnum } from '../../../common/enums/interview-round.enum';

@Entity('interviews')
@Index(['tenantId', 'applicationId', 'interviewerId'])
export class Interview extends TenantAwareEntity {

  @Column({
    name: 'application_id',
    type: 'uuid',
  })
  applicationId!: string;

  @ManyToOne(() => CandidateApplication, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'application_id', referencedColumnName: 'id' },
  ])
  application!: CandidateApplication;

  @Column({
    name: 'interviewer_id',
  })
  interviewerId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'interviewer_id', referencedColumnName: 'id' },
  ])
  interviewer!: Employee;

  @Column({
    type: 'enum',
    enum: InterviewRoundEnum,
    name: 'round_name',
  })
  roundName!: InterviewRoundEnum;

  @OneToMany(() => InterviewFeedback, (feedback) => feedback.interview)
  feedbacks!: InterviewFeedback[];

  @Column({
    type: 'timestamp',
    name: 'scheduled_at',
  })
  scheduledAt!: Date;

  @Column({
    nullable: true,
    name: 'meeting_link',
    type: 'text',
  })
  meetingLink!: string | null;

  @Column({
    nullable: true,
    type: 'text',
  })
  remarks!: string | null;

  @Column({
    type: 'enum',
    enum: InterviewStatusEnum,
    default: InterviewStatusEnum.SCHEDULED,
  })
  status!: InterviewStatusEnum;

}
