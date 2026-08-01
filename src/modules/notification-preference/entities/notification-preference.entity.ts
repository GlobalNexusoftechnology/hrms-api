import { Employee } from '../../employees/entities/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('notification_preferences')
@Index(['tenantId', 'employeeId'], { unique: true })
export class NotificationPreference extends TenantAwareEntity {
  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @OneToOne(() => Employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
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
