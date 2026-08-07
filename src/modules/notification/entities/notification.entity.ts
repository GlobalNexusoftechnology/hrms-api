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
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('notifications')
@Index(['tenantId', 'employeeId'])
export class Notification extends TenantAwareEntity {

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

}
