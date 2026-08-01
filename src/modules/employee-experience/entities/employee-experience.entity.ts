import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_experience')
@Index(['tenantId', 'employeeId'])
export class EmployeeExperience extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'varchar', length: 150, name: 'company_name' })
  companyName!: string;

  @Column({ type: 'varchar', length: 100 })
  designation!: string;

  @Column({ type: 'date', name: 'from_date' })
  fromDate!: Date;

  @Column({ type: 'date', name: 'to_date', nullable: true })
  toDate: Date | null = null; // null if currently working here

  @Column({ type: 'text', name: 'reason_for_leaving', nullable: true })
  reasonForLeaving: string | null = null;

}
