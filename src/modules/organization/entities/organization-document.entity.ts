import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from './organization.entity';
import { Branch } from './branch.entity';
import { OrganizationDocumentTypeEnum } from '../../../common/enums/organization-document-type.enum';

@Entity('organization_documents')
export class OrganizationDocument extends BaseEntity {
  @Column({ name: 'organization_id' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ name: 'branch_id', nullable: true })
  @Index()
  branchId: string | null = null;

  @ManyToOne(() => Branch, (branch) => branch.documents, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null = null;

  @Column({ name: 'document_type', type: 'enum', enum: OrganizationDocumentTypeEnum })
  documentType!: OrganizationDocumentTypeEnum;

  @Column()
  title!: string;

  @Column({ name: 'file_url' })
  fileUrl!: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null = null;
}
