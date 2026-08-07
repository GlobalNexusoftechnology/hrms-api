import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TenantStatus } from '../../../common/enums/tenant-status.enum';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column()
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true })
  code!: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status!: TenantStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Organization, (org) => org.tenant)
  organizations!: Organization[];
}
