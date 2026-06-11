import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Training } from './training.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { TrainingStatusEnum } from '../../../common/enums/training-status.enum';

@Entity('training_assignments')
export class TrainingAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'training_id',
  })
  trainingId!: string;

  @ManyToOne(() => Training, (training) => training.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'training_id',
  })
  training!: Training;

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
  // STATUS
  // =====================

  @Column({
    type: 'enum',

    enum: TrainingStatusEnum,

    default: TrainingStatusEnum.PENDING,
  })
  status!: TrainingStatusEnum;

  @Column({
    default: 0,

    name: 'progress_percentage',
  })
  progressPercentage!: number;

  @CreateDateColumn({
    name: 'assigned_at',
  })
  assignedAt!: Date;

  @Column({
    type: 'timestamp',

    nullable: true,

    name: 'completed_at',
  })
  completedAt!: Date | null;
}
