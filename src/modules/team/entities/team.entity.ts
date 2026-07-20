import { Department } from '../../departments/entities/department.entity';
import { Employee } from '../../employees/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TeamMember } from './team-member.entity';




@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
  })
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
  @JoinColumn({
    name: 'departmentId',
  })
  department?: Department;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  teamLeadId?: string;

  @ManyToOne(() => Employee, {
    nullable: true,
  })
  @JoinColumn({
    name: 'teamLeadId',
  })
  teamLead?: Employee;

  @OneToMany(() => TeamMember, (member) => member.team)
  members?: TeamMember[];

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
