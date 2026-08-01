import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('leave_types')
@Index(['tenantId', 'name'], { unique: true })
@Index(['tenantId', 'code'], { unique: true })
export class LeaveType extends TenantAwareEntity {
  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

}
