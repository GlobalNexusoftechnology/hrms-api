import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'correlation_id', type: 'uuid', nullable: true })
  correlationId: string;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId: string; // 'SYSTEM', 'CRON', or UUID

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'entity_name', type: 'varchar', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'version_number', type: 'int', default: 1 })
  versionNumber: number;

  @Column({ type: 'int', nullable: true })
  status: number; // HTTP Status

  @Column({ type: 'int', nullable: true })
  duration: number; // in ms

  @Column({ type: 'enum', enum: AuditSeverity, default: AuditSeverity.INFO })
  severity: AuditSeverity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: string[];

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
