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

@Entity('leave_balances')
@Index(['employeeId', 'month', 'year'], {
  unique: true,
})
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  @Column()
  month!: number;

  @Column()
  year!: number;

  @Column({
    default: 2,

    name: 'monthly_credit',
  })
  monthlyCredit!: number;

  @Column({
    default: 0,

    name: 'carry_forward',
  })
  carryForward!: number;

  @Column({
    default: 0,

    name: 'used_leaves',
  })
  usedLeaves!: number;

  @Column({
    default: 0,

    name: 'paid_leaves_used',
  })
  paidLeavesUsed!: number;

  @Column({
    default: 0,

    name: 'unpaid_leaves_used',
  })
  unpaidLeavesUsed!: number;

  @Column({
    default: 0,

    name: 'remaining_leaves',
  })
  remainingLeaves!: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
