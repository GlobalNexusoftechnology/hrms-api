


import { Employee } from '../../employees/entities/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    name: 'employee_id',
  })
  employeeId!: string;

  @OneToOne(() => Employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  @Column({
    default: true,
  })
  task!: boolean;

  @Column({
    default: true,
  })
  leave!: boolean;

  @Column({
    default: true,
  })
  attendance!: boolean;

  @Column({
    default: true,
  })
  payroll!: boolean;

  @Column({
    default: true,
  })
  project!: boolean;

  @Column({
    default: true,
  })
  team!: boolean;

  @Column({
    default: true,
  })
  standup!: boolean;

  @Column({
    default: true,
  })
  holiday!: boolean;

  @Column({
    default: true,
  })
  training!: boolean;

  @Column({
    default: true,
  })
  interview!: boolean;

  @Column({
    default: true,
  })
  announcement!: boolean;
}
