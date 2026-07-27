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
import { Department } from '../../departments/entities/department.entity';
import { Branch } from '../../organization/entities/branch.entity';
import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';
import { JobStatusEnum } from '../../../common/enums/job-status.enum';
import { CandidateApplication } from './candidate-application.entity';

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({
    name: 'branch_id',
    type: 'uuid',
  })
  branchId!: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
