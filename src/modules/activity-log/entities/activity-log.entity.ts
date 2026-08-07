import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ActivityAction } from '../enums/activity-action.enum';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Index()
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string | null;

  @Index()
  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string | null;

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
}
