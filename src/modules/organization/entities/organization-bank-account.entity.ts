import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Branch } from './branch.entity';

@Entity('organization_bank_accounts')
export class OrganizationBankAccount extends BaseEntity {
  @Column({ name: 'organization_id' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ name: 'branch_id', nullable: true })
  @Index()
  branchId: string | null = null;

  @ManyToOne(() => Branch, (branch) => branch.bankAccounts, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null = null;

  @Column({ name: 'bank_name' })
  bankName!: string;

  @Column({ name: 'account_name' })
  accountName!: string;

  @Column({ name: 'account_number' })
  accountNumber!: string;

  @Column({ name: 'ifsc_code' })
  ifscCode!: string;

  @Column({ name: 'branch_name', type: 'varchar', nullable: true })
  branchName: string | null = null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;
}
