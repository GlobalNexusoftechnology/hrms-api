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

import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { Attendance } from './attendance.entity';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';

@Entity('attendance_corrections')
@Index(['tenantId', 'employeeId'])
export class AttendanceCorrection extends TenantAwareEntity {

  // REQUESTED BY
  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  // ATTENDANCE RECORD
  @Column({
    name: 'attendance_id',
  })
  attendanceId!: string;

  @ManyToOne(() => Attendance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'attendance_id', referencedColumnName: 'id' },
  ])
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
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'reviewed_by_id', referencedColumnName: 'id' },
  ])
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

}
