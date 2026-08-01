import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { JobPosting } from './job-posting.entity';
import { CandidateStatusEnum } from '../../../common/enums/candidate-status.enum';

import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('candidate_applications')
@Index(['tenantId', 'candidateId', 'jobId'])
export class CandidateApplication extends TenantAwareEntity {

  @Column({ name: 'candidate_id', type: 'uuid' })
  candidateId!: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'candidate_id', referencedColumnName: 'id' },
  ])
  candidate!: Candidate;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId!: string;

  @ManyToOne(() => JobPosting, (job) => job.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'job_id', referencedColumnName: 'id' },
  ])
  job!: JobPosting;

  @Column({
    type: 'enum',
    enum: CandidateStatusEnum,
    default: CandidateStatusEnum.APPLIED,
  })
  status!: CandidateStatusEnum;

}
