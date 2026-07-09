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

@Entity('payrolls')
@Index(['employeeId', 'month', 'year'], {
  unique: true,
})
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================
  // EMPLOYEE
  // =====================

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

  // =====================
  // PERIOD
  // =====================

  @Column()
  month!: number;

  @Column()
  year!: number;

  // =====================
  // SALARY SNAPSHOT
  // =====================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    name: 'gross_salary',
  })
  grossSalary!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    name: 'net_salary',
  })
  netSalary!: number;

  // =====================
  // ATTENDANCE
  // =====================

  @Column({
    default: 0,

    name: 'present_days',
  })
  presentDays!: number;

  @Column({
    default: 0,

    name: 'late_days',
  })
  lateDays!: number;

  @Column({
    default: 0,

    name: 'half_days',
  })
  halfDays!: number;

  @Column({
    default: 0,

    name: 'absent_days',
  })
  absentDays!: number;

  @Column({
    default: 0,

    name: 'paid_leaves',
  })
  paidLeaves!: number;

  @Column({
    default: 0,

    name: 'unpaid_leaves',
  })
  unpaidLeaves!: number;

  // =====================
  // MONEY
  // =====================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    default: 0,

    name: 'absent_deduction',
  })
  absentDeduction!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    default: 0,

    name: 'half_day_deduction',
  })
  halfDayDeduction!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    default: 0,

    name: 'leave_deduction',
  })
  leaveDeduction!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'late_deduction' })
  lateDeduction!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    default: 0,

    name: 'overtime_amount',
  })
  overtimeAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'bonus_amount' })
  bonusAmount!: number;

  @Column({ type: 'text', nullable: true, name: 'bonus_reason' })
  bonusReason!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'deduction_amount' })
  deductionAmount!: number;

  @Column({ type: 'text', nullable: true, name: 'deduction_reason' })
  deductionReason!: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,

    name: 'final_salary',
  })
  finalSalary!: number;

  // =====================
  // STATUS
  // =====================

  @Column({
    default: false,

    name: 'is_paid',
  })
  isPaid!: boolean;

  @Column({
    type: 'timestamp',

    nullable: true,

    name: 'paid_at',
  })
  paidAt!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
