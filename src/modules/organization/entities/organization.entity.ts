import { Entity, Column, OneToMany, OneToOne, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OrganizationStatus } from '../../../common/enums/organization-status.enum';
import { OrganizationAddress } from './organization-address.entity';
import { OrganizationTax } from './organization-tax.entity';
import { OrganizationSettings } from './organization-settings.entity';
import { Branch } from './branch.entity';
import { OrganizationContact } from './organization-contact.entity';
import { OrganizationBankAccount } from './organization-bank-account.entity';
import { OrganizationDocument } from './organization-document.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ name: 'tenant_id', nullable: true })
  @Index()
  tenantId!: string | null;

  @ManyToOne(() => Tenant, (tenant) => tenant.organizations, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;
  @Index({ unique: true })
  @Column({ name: 'organization_code' })
  organizationCode!: string;

  @Column()
  name!: string;

  @Column({ name: 'legal_name' })
  legalName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string | null;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl?: string | null;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.PENDING,
  })
  status!: OrganizationStatus;

  // Relationships
  @OneToMany(() => OrganizationAddress, (address) => address.organization, {
    cascade: ['soft-remove'],
  })
  addresses!: OrganizationAddress[];

  @OneToOne(() => OrganizationTax, (tax) => tax.organization, {
    cascade: ['soft-remove'],
  })
  tax!: OrganizationTax;

  @OneToOne(() => OrganizationSettings, (settings) => settings.organization, { cascade: ['soft-remove'] })
  settings!: OrganizationSettings;

  @OneToMany(() => Branch, (branch) => branch.organization, { cascade: ['soft-remove'] })
  branches!: Branch[];

  @OneToMany(() => OrganizationContact, (contact) => contact.organization, { cascade: ['soft-remove'] })
  contacts!: OrganizationContact[];

  @OneToMany(() => OrganizationBankAccount, (bankAccount) => bankAccount.organization, { cascade: ['soft-remove'] })
  bankAccounts!: OrganizationBankAccount[];

  @OneToMany(() => OrganizationDocument, (document) => document.organization, { cascade: ['soft-remove'] })
  documents!: OrganizationDocument[];
}
