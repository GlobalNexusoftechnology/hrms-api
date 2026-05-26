import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';
import { AttendanceCorrection } from './correction.entity';

@Entity('attendances')
@Index(['employeeId', 'date'], {
  unique: true,
})
export class Attendance {
  @Index(['employeeId', 'date'], { unique: true })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  @OneToMany(() => AttendanceCorrection, (correction) => correction.attendance)
  corrections!: AttendanceCorrection[];

  @Column({
    type: 'date',
  })
  date!: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'check_in',
  })
  checkIn!: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'check_out',
  })
  checkOut!: Date | null;

  @Column({
    type: 'text',

    nullable: true,

    name: 'early_checkout_reason',
  })
  earlyCheckoutReason: string | null = null;

  @Column({
    default: 0,

    name: 'worked_minutes',
  })
  workedMinutes!: number;

  @Column({
    default: 0,

    name: 'overtime_minutes',
  })
  overtimeMinutes!: number;

  @Column({
    type: 'enum',

    enum: AttendanceStatus,

    default: AttendanceStatus.PRESENT,
  })
  status!: AttendanceStatus;

  @Column({
    type: 'text',

    nullable: true,

    name: 'check_in_location',
  })
  checkInLocation: string | null = null;

  @Column({
    type: 'text',

    nullable: true,

    name: 'check_out_location',
  })
  checkOutLocation: string | null = null;

  @Column({
    default: false,

    name: 'is_auto_checkout',
  })
  isAutoCheckout!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
