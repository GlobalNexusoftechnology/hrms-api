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

@Entity('leave_balances')
@Index(['tenantId', 'employeeId', 'leaveTypeId', 'year'], { unique: true })
export class LeaveBalance extends TenantAwareEntity {

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

  @Column()
  year!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accrued!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  used!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'carried_forward',
    default: 0,
  })
  carriedForward!: number;

  // Remaining is computed on the fly in the response/service layer
  // It is conceptually: (accrued + carriedForward) - used
}
