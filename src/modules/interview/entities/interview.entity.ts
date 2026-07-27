import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CandidateApplication } from './candidate-application.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { InterviewStatusEnum } from '../../../common/enums/interview-status.enum';
import { InterviewFeedback } from './interview-feedback.entity';
import { InterviewRoundEnum } from '../../../common/enums/interview-round.enum';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'application_id',
    type: 'uuid',
  })
  applicationId!: string;

  @ManyToOne(() => CandidateApplication, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'application_id',
  })
  application!: CandidateApplication;

  @Column({
    name: 'interviewer_id',
  })
  interviewerId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({
    name: 'interviewer_id',
  })
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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
