import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from '../../leave-type/entities/leave-type.entity';

@Entity('leave_balances')
@Index(['employeeId', 'leaveTypeId', 'year'], { unique: true })
export class LeaveBalance {
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

  @Column()
  year!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accrued!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  used!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'carried_forward', default: 0 })
  carriedForward!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Remaining is computed on the fly in the response/service layer
  // It is conceptually: (accrued + carriedForward) - used
}
