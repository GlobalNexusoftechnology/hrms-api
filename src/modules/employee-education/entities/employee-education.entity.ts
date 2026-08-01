import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_education')
@Index(['tenantId', 'employeeId'])
export class EmployeeEducation extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'varchar', length: 150 })
  degree!: string;

  @Column({ type: 'varchar', length: 200 })
  institution!: string;

  @Column({ type: 'int', name: 'passing_year' })
  passingYear!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string | null = null; // Can be percentage or CGPA/grade

}
