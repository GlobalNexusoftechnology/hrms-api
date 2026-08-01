import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum AuthStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  LOCKED = 'LOCKED',
}

export enum AuthEvent {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  MFA = 'MFA',
  ACCOUNT_LOCK = 'ACCOUNT_LOCK',
}

@Entity('auth_logs')
export class AuthLog extends BaseEntity {
  @Index()
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string | null;

  @Index()
  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string;

  @Column({ type: 'enum', enum: AuthEvent })
  event: AuthEvent;

  @Column({ type: 'enum', enum: AuthStatus })
  status: AuthStatus;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  device: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // for failed logins
}
