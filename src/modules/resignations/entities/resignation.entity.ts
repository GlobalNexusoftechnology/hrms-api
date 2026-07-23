import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ResignationStatusEnum } from '../../../common/enums/resignation-status.enum';

@Entity('resignations')
export class Resignation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'resignation_date', type: 'date' })
  resignationDate!: Date;

  @Column({ name: 'requested_last_working_date', type: 'date' })
  requestedLastWorkingDate!: Date;

  @Column({ name: 'approved_last_working_date', type: 'date', nullable: true })
  approvedLastWorkingDate!: Date | null;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  remarks!: string | null;

  @Column({
    type: 'enum',
    enum: ResignationStatusEnum,
    default: ResignationStatusEnum.PENDING,
  })
  status!: ResignationStatusEnum;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'executed_by', type: 'uuid', nullable: true })
  executedBy!: string | null;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;
}
