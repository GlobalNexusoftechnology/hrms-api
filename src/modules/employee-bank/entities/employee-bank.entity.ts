import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_banks')
@Index(['tenantId', 'employeeId'])
export class EmployeeBank extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'varchar', length: 150, name: 'bank_name' })
  bankName!: string;

  @Column({ type: 'varchar', length: 150, name: 'account_holder_name' })
  accountHolderName!: string;

  @Column({ type: 'varchar', length: 50, name: 'account_number' })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 20 })
  ifsc!: string;

  @Column({ type: 'varchar', length: 100, name: 'branch_name', nullable: true })
  branchName: string | null = null;

  @Column({ type: 'boolean', default: true, name: 'is_primary' })
  isPrimary!: boolean;

}
