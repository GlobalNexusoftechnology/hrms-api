import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { OrganizationContact } from './organization-contact.entity';
import { OrganizationBankAccount } from './organization-bank-account.entity';
import { OrganizationDocument } from './organization-document.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ name: 'organization_id' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.branches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ name: 'is_head_office', type: 'boolean', default: false })
  isHeadOffice!: boolean;

  @Column({ name: 'line1' })
  line1!: string;

  @Column({ name: 'line2', type: 'varchar', nullable: true })
  line2: string | null = null;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  country!: string;

  @Column()
  zip!: string;

  @Column({ type: 'varchar', nullable: true })
  timezone: string | null = null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'manager_id', nullable: true })
  @Index()
  managerId: string | null = null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee | null = null;

  @OneToMany(() => OrganizationContact, (contact) => contact.branch)
  contacts!: OrganizationContact[];

  @OneToMany(() => OrganizationBankAccount, (bankAccount) => bankAccount.branch)
  bankAccounts!: OrganizationBankAccount[];

  @OneToMany(() => OrganizationDocument, (document) => document.branch)
  documents!: OrganizationDocument[];
}
