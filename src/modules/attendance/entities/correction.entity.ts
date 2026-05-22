import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

import { Attendance } from './attendance.entity';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';

@Entity('attendance_corrections')
export class AttendanceCorrection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // REQUESTED BY
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

  // ATTENDANCE RECORD
  @Column({
    name: 'attendance_id',
  })
  attendanceId!: string;

  @ManyToOne(() => Attendance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'attendance_id',
  })
  attendance!: Attendance;

  // CURRENT VALUES
  @Column({
    type: 'timestamp',
    nullable: true,

    name: 'current_check_in',
  })
  currentCheckIn!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,

    name: 'current_check_out',
  })
  currentCheckOut!: Date | null;

  // REQUESTED VALUES
  @Column({
    type: 'timestamp',
    nullable: true,

    name: 'requested_check_in',
  })
  requestedCheckIn!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,

    name: 'requested_check_out',
  })
  requestedCheckOut!: Date | null;

  @Column({
    type: 'text',
  })
  reason!: string;

  @Column({
    type: 'enum',

    enum: CorrectionStatus,

    default: CorrectionStatus.PENDING,
  })
  status!: CorrectionStatus;

  // REVIEWED BY
  @Column({
    nullable: true,

    name: 'reviewed_by_id',
  })
  reviewedById: string | null = null;

  @ManyToOne(() => Employee, {
    nullable: true,
  })
  @JoinColumn({
    name: 'reviewed_by_id',
  })
  reviewer!: Employee | null;

  @Column({
    type: 'text',

    nullable: true,

    name: 'review_comment',
  })
  reviewComment: string | null = null;

  @Column({
    type: 'timestamp',
    nullable: true,

    name: 'reviewed_at',
  })
  reviewedAt: Date | null = null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
