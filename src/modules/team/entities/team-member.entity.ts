import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('team_members')
@Unique(['teamId', 'employeeId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
  })
  teamId!: string;

  @ManyToOne(() => Team, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'teamId',
  })
  team!: Team;

  @Column({
    type: 'uuid',
  })
  employeeId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({
    name: 'employeeId',
  })
  employee!: Employee;

  @CreateDateColumn()
  createdAt!: Date;
}
