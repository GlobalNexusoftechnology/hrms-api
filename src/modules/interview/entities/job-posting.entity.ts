import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import { Branch } from '../../organization/entities/branch.entity';
import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';
import { JobStatusEnum } from '../../../common/enums/job-status.enum';
import { CandidateApplication } from './candidate-application.entity';

@Entity('job_postings')
@Index(['tenantId', 'departmentId', 'branchId'])
export class JobPosting extends TenantAwareEntity {

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  requirements!: string;

  @Column({
    name: 'department_id',
    type: 'uuid',
  })
  departmentId!: string;

  @ManyToOne(() => Department)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'department_id', referencedColumnName: 'id' },
  ])
  department!: Department;

  @Column({
    name: 'branch_id',
    type: 'uuid',
  })
  branchId!: string;

  @ManyToOne(() => Branch)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'branch_id', referencedColumnName: 'id' },
  ])
  branch!: Branch;

  @Column({
    type: 'enum',
    enum: EmploymentTypeEnum,
    name: 'employment_type',
  })
  employmentType!: EmploymentTypeEnum;

  @Column({
    nullable: true,
    name: 'salary_range',
  })
  salaryRange!: string;

  @Column({
    nullable: true,
    name: 'experience_level',
  })
  experienceLevel!: string;

  @Column({
    type: 'enum',
    enum: JobStatusEnum,
    default: JobStatusEnum.OPEN,
  })
  status!: JobStatusEnum;

  @OneToMany(() => CandidateApplication, (app) => app.job)
  applications!: CandidateApplication[];

}
