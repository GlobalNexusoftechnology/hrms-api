import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

import { DocumentTypeEnum } from '../../../common/enums/document-type.enum';

@Entity('employee_documents')
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.documents)
  @JoinColumn({
    name: 'employee_id',
  })
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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt!: Date;
}
