import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ProficiencyLevelEnum } from '../../../common/enums/proficiency-level.enum';

@Entity('employee_skills')
export class EmployeeSkill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'varchar', length: 150, name: 'skill_name' })
  skillName!: string;

  @Column({ type: 'enum', enum: ProficiencyLevelEnum, name: 'proficiency_level' })
  proficiencyLevel!: ProficiencyLevelEnum;

  @Column({ type: 'varchar', length: 255, name: 'certification_details', nullable: true })
  certificationDetails: string | null = null;

  @Column({ type: 'int', nullable: true })
  year: number | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
