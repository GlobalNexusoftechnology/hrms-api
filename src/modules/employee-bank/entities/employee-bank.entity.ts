import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('employee_banks')
export class EmployeeBank {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'varchar', length: 150, name: 'bank_name' })
  bankName!: string;

  @Column({ type: 'varchar', length: 150, name: 'account_holder_name' })
  accountHolderName!: string;

  @Column({ type: 'varchar', length: 50, name: 'account_number' })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 20 })
  ifsc!: string;

  @Column({ type: 'varchar', length: 100, name: 'branch_name', nullable: true })
  branchName: string | null = null;

  @Column({ type: 'boolean', default: true, name: 'is_primary' })
  isPrimary!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
