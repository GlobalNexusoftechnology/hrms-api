import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'time', name: 'start_time' })
  startTime!: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime!: string;

  @Column({ type: 'boolean', default: false, name: 'cross_midnight' })
  crossMidnight!: boolean;

  @Column({ type: 'int', name: 'standard_working_minutes', default: 480 })
  standardWorkingMinutes!: number;

  @Column({ type: 'int', default: 60, name: 'total_break_minutes' })
  totalBreakMinutes!: number;

  @Column({ type: 'boolean', default: false, name: 'include_break_in_working_hours' })
  includeBreakInWorkingHours!: boolean;

  @Column({ type: 'int', default: 15, name: 'late_grace_minutes' })
  lateGraceMinutes!: number;

  @Column({ type: 'int', default: 5, name: 'early_leave_grace_minutes' })
  earlyLeaveGraceMinutes!: number;

  @Column({ type: 'int', default: 240, name: 'half_day_threshold_minutes' })
  halfDayThresholdMinutes!: number;

  @Column({ type: 'int', default: 480, name: 'overtime_threshold_minutes' })
  overtimeThresholdMinutes!: number;

  @Column({ type: 'int', default: 30, name: 'minimum_overtime_minutes' })
  minimumOvertimeMinutes!: number;

  @Column({ type: 'int', default: 60, name: 'earliest_check_in_minutes' })
  earliestCheckInMinutes!: number;

  @Column({ type: 'int', default: 240, name: 'latest_check_in_minutes' })
  latestCheckInMinutes!: number;

  @Column({ type: 'boolean', default: false, name: 'is_flexible' })
  isFlexible!: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
