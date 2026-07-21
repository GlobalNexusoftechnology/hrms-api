import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { OrganizationContact } from './organization-contact.entity';
import { OrganizationBankAccount } from './organization-bank-account.entity';
import { OrganizationDocument } from './organization-document.entity';
import { BranchType } from '../../../common/enums/branch-type.enum';
import { BranchStatus } from '../../../common/enums/branch-status.enum';

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

  @Column({ name: 'display_name', nullable: true })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'branch_type', type: 'enum', enum: BranchType, default: BranchType.BRANCH_OFFICE })
  branchType!: BranchType;

  @Column({ unique: true })
  code!: string;

  @Column({ name: 'is_head_office', type: 'boolean', default: false })
  isHeadOffice!: boolean;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'line1', nullable: true })
  line1?: string;

  @Column({ name: 'line2', type: 'varchar', nullable: true })
  line2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  zip?: string;

  @Column({ type: 'varchar', nullable: true })
  timezone?: string;

  @Column({ type: 'enum', enum: BranchStatus, default: BranchStatus.ACTIVE })
  status!: BranchStatus;

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
