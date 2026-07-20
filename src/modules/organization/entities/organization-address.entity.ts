import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { OrganizationAddressType } from '../../../common/enums/organization-address-type.enum';

@Entity('organization_addresses')
@Index(['organizationId', 'addressType'], { unique: true })
export class OrganizationAddress extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({
    name: 'address_type',
    type: 'enum',
    enum: OrganizationAddressType,
    default: OrganizationAddressType.REGISTERED,
  })
  addressType!: OrganizationAddressType;

  @Column()
  line1!: string;

  @Column({ type: 'varchar', nullable: true })
  line2?: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  country!: string;

  @Column()
  zip!: string;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number | null;

  @ManyToOne(() => Organization, (org) => org.addresses)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
}
