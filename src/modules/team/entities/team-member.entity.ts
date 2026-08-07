import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { TenantAwareEntity } from '../../../common/entities/tenant-aware.entity';
import { Team } from './team.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('team_members')
@Index(['tenantId', 'teamId', 'employeeId'], { unique: true })
export class TeamMember extends TenantAwareEntity {

  @Column({
    type: 'uuid',
  })
  teamId!: string;

  @ManyToOne(() => Team, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'teamId', referencedColumnName: 'id' },
  ])
  team!: Team;

  @Column({
    type: 'uuid',
  })
  employeeId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'employeeId', referencedColumnName: 'id' },
  ])
  employee!: Employee;
}
