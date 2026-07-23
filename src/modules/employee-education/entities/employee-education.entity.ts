import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('employee_education')
export class EmployeeEducation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'varchar', length: 150 })
  degree!: string;

  @Column({ type: 'varchar', length: 200 })
  institution!: string;

  @Column({ type: 'int', name: 'passing_year' })
  passingYear!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string | null = null; // Can be percentage or CGPA/grade

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
