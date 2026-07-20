import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Branch } from './branch.entity';
import { OrganizationContactTypeEnum } from '../../../common/enums/organization-contact-type.enum';

@Entity('organization_contacts')
export class OrganizationContact extends BaseEntity {
  @Column({ name: 'organization_id' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ name: 'branch_id', nullable: true })
  @Index()
  branchId: string | null = null;

  @ManyToOne(() => Branch, (branch) => branch.contacts, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null = null;

  @Column({ name: 'contact_type', type: 'enum', enum: OrganizationContactTypeEnum })
  contactType!: OrganizationContactTypeEnum;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  designation: string | null = null;
}
