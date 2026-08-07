import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

import { DocumentTypeEnum } from '../../../common/enums/document-type.enum';

@Entity('employee_documents')
@Index(['tenantId', 'employeeId'])
export class EmployeeDocument extends TenantAwareEntity {

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.documents)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({
    type: 'enum',
    enum: DocumentTypeEnum,

    name: 'document_type',
  })
  documentType!: DocumentTypeEnum;

  @Column({
    name: 'file_name',
  })
  fileName!: string;

  @Column({
    type: 'text',
    name: 'file_url',
  })
  fileUrl!: string;

  @Column({
    name: 'mime_type',
  })
  mimeType!: string;

  @Column({
    name: 'file_size',
    type: 'bigint',
  })
  fileSize!: number;

}
