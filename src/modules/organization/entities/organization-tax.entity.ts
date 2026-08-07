import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';

@Entity('organization_taxes')
export class OrganizationTax extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column()
  pan!: string;

  @Column({ type: 'varchar', nullable: true })
  gst?: string | null;

  @Column({ type: 'varchar', nullable: true })
  tan?: string | null;

  @Column({ type: 'varchar', nullable: true })
  cin?: string | null;

  @Column({ type: 'varchar', nullable: true })
  msme?: string | null;

  @OneToOne(() => Organization, (org) => org.tax)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
