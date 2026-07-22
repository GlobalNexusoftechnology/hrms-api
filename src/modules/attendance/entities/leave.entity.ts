import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';
import { LeaveType } from '../../leave-type/entities/leave-type.entity';
import { Employee } from '../../employees/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leaves')
export class Leave {
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

  @Column({ name: 'leave_type_id' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({
    type: 'date',

    name: 'start_date',
  })
  startDate!: string;

  @Column({
    type: 'date',

    name: 'end_date',
  })
  endDate!: string;

  @Column({
    type: 'text',
  })
  reason!: string;

  @Column({
    type: 'enum',

    enum: LeaveStatusEnum,

    default: LeaveStatusEnum.PENDING,
  })
  status!: LeaveStatusEnum;

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
    nullable: true,

    type: 'text',

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
