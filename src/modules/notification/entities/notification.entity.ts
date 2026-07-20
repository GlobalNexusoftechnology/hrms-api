import { NotificationPreference } from '../../notification-preference/entities/notification-preference.entity';
import { NotificationType } from '../../../common/enums/NotificationType.enum';
import { Employee } from '../../employees/entities/employee.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
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
  title!: string;

  @Column({
    type: 'text',
  })
  message!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,

    default: NotificationType.GENERAL,
  })
  type!: NotificationType;

  @OneToOne(() => NotificationPreference, (preference) => preference.employee)
  notificationPreference!: NotificationPreference;

  @Column({
    nullable: true,
  })
  referenceId?: string;

  @Column({
    default: false,
  })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
