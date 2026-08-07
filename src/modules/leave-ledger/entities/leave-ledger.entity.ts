import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../leave-type/entities/leave-type.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

export enum LeaveTransactionType {
  ACCRUAL = 'ACCRUAL',
  LEAVE_TAKEN = 'LEAVE_TAKEN',
  ADJUSTMENT = 'ADJUSTMENT',
  CARRY_FORWARD = 'CARRY_FORWARD',
  ENCASHMENT = 'ENCASHMENT',
}

@Entity('leave_ledger')
@Index(['tenantId', 'employeeId', 'leaveTypeId'])
export class LeaveLedger extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ name: 'leave_type_id' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'leave_type_id', referencedColumnName: 'id' },
  ])
  leaveType!: LeaveType;

  @Column({
    type: 'enum',
    enum: LeaveTransactionType,
    name: 'transaction_type',
  })
  transactionType!: LeaveTransactionType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  days!: number;

  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string;

  @Column({ nullable: true })
  remarks?: string;

}
