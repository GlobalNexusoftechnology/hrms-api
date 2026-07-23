import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('employee_experience')
export class EmployeeExperience {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
