import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ProficiencyLevelEnum } from '../../../common/enums/proficiency-level.enum';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';

@Entity('employee_skills')
@Index(['tenantId', 'employeeId'])
export class EmployeeSkill extends TenantAwareEntity {

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employee_id', referencedColumnName: 'id' },
  ])
  employee!: Employee;

  @Column({ type: 'varchar', length: 150, name: 'skill_name' })
  skillName!: string;

  @Column({
    type: 'enum',
    enum: ProficiencyLevelEnum,
    name: 'proficiency_level',
  })
  proficiencyLevel!: ProficiencyLevelEnum;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'certification_details',
    nullable: true,
  })
  certificationDetails: string | null = null;

  @Column({ type: 'int', nullable: true })
  year: number | null = null;

}
