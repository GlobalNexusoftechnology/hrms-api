import { CandidateStatusEnum } from '../../../common/enums/candidate-status.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'first_name',
  })
  firstName!: string;

  @Column({
    name: 'last_name',
  })
  lastName!: string;

  @Column({
    unique: true,
  })
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

  @Column({
    type: 'enum',
    enum: CandidateStatusEnum,
    default: CandidateStatusEnum.APPLIED,
  })
  status!: CandidateStatusEnum;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: 'text',
    name: 'deleted_at',
  })
  deletedAt!: Date | null;
}
