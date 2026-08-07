import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Index(['tenantId', 'id'], { unique: true })
export abstract class TenantAwareEntity extends BaseEntity {
  @Index()
  @Column({ name: 'tenant_id', type: 'uuid', update: false, nullable: false })
  tenantId!: string;
}
