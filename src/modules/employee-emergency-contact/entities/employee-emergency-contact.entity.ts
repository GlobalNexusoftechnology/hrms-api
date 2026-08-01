import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_emergency_contacts')
@Index(['tenantId', 'employeeId'])
export class EmployeeEmergencyContact extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  relationship!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'alternate_phone',
    nullable: true,
  })
  alternatePhone: string | null = null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null = null;

  @Column({ type: 'text', nullable: true })
  address: string | null = null;

  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  isPrimary!: boolean;

}
