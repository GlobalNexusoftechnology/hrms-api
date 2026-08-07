import { CandidateApplication } from './candidate-application.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('candidates')
@Index(['tenantId', 'email'], { unique: true })
export class Candidate extends TenantAwareEntity {

  @Column({
    name: 'first_name',
  })
  firstName!: string;

  @Column({
    name: 'last_name',
  })
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  mobile!: string;

  @Column({
    nullable: true,
    name: 'resume_url',
    type: 'text',
  })
  resumeUrl!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  experience!: number | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'current_company',
  })
  currentCompany!: string | null;

  @Column({
    nullable: true,
    name: 'current_ctc',
    type: 'decimal',
  })
  currentCtc!: number | null;

  @Column({
    nullable: true,
    name: 'expected_ctc',
    type: 'decimal',
  })
  expectedCtc!: number | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'notice_period',
  })
  noticePeriod!: number | null;

  @Column({
    nullable: true,
    type: 'text',
  })
  skills!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  source!: string | null;

  @OneToMany(() => CandidateApplication, (app) => app.candidate)
  applications!: CandidateApplication[];

}
