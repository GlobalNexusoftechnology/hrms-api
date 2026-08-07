import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Branch } from '../../organization/entities/branch.entity';
import { Organization } from '../../organization/entities/organization.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import { TeamMember } from './team-member.entity';

@Entity('teams')
@Index(['tenantId', 'name'], { unique: true })
export class Team extends TenantAwareEntity {
  @Column()
  name!: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description?: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  departmentId?: string;

  @ManyToOne(() => Department, {
    nullable: true,
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'departmentId', referencedColumnName: 'id' },
  ])
  department?: Department;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  teamLeadId?: string;

  @ManyToOne(() => Employee, {
    nullable: true,
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'teamLeadId', referencedColumnName: 'id' },
  ])
  teamLead?: Employee;

  @OneToMany(() => TeamMember, (member) => member.team)
  members?: TeamMember[];

  @Column({ type: 'uuid', nullable: true })
  branchId?: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'branchId', referencedColumnName: 'id' },
  ])
  branch?: Branch;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'organizationId', referencedColumnName: 'id' },
  ])
  organization?: Organization;

  @Column({
    default: true,
  })
  isActive!: boolean;
}
