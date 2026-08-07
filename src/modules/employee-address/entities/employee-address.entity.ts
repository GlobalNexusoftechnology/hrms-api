import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { AddressTypeEnum } from '../../../common/enums/address-type.enum';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_addresses')
@Index(['tenantId', 'employeeId'])
export class EmployeeAddress extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'enum', enum: AddressTypeEnum })
  type!: AddressTypeEnum;

  @Column({ type: 'text', name: 'address1' })
  address1!: string;

  @Column({ type: 'text', name: 'address2', nullable: true })
  address2: string | null = null;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string | null = null;

  @Column({ type: 'varchar', length: 100 })
  state!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 20, name: 'postal_code' })
  postalCode!: string;

  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  isPrimary!: boolean;

}
