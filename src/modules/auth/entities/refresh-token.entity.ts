import { Employee } from '../../../modules/employees/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({
    name: 'employee_id',
  })
  employeeId!: string;

  @Column({
    name: 'token_hash',
    type: 'text',
  })
  tokenHash!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt!: Date;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  @Column({
    name: 'is_revoked',
    default: false,
  })
  isRevoked!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
