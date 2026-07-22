import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../leave-type/entities/leave-type.entity';

export enum LeaveTransactionType {
  ACCRUAL = 'ACCRUAL',
  LEAVE_TAKEN = 'LEAVE_TAKEN',
  ADJUSTMENT = 'ADJUSTMENT',
  CARRY_FORWARD = 'CARRY_FORWARD',
  ENCASHMENT = 'ENCASHMENT',
}

@Entity('leave_ledger')
@Index(['employeeId', 'leaveTypeId'])
export class LeaveLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'leave_type_id' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({ type: 'enum', enum: LeaveTransactionType, name: 'transaction_type' })
  transactionType!: LeaveTransactionType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  days!: number;

  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string;

  @Column({ nullable: true })
  remarks?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
