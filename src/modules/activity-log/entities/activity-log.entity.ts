import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ActivityAction } from '../enums/activity-action.enum';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId?: string;

  @Column({ length: 50, nullable: true })
  module?: string;

  @Column({ type: 'enum', enum: ActivityAction })
  action!: ActivityAction;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue?: Record<string, any>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'request_method', length: 10, nullable: true })
  requestMethod?: string;

  @Column({ name: 'request_path', type: 'text', nullable: true })
  requestPath?: string;

  @Column({ length: 20, nullable: true })
  status?: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode?: number;

  @Column({ name: 'response_time', type: 'int', nullable: true })
  responseTime?: number; // in milliseconds

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
