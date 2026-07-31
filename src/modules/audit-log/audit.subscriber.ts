import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  SoftRemoveEvent,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditAction } from './entities/audit-log.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { maskData } from './utils/masking.util';

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);

  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    private readonly cls: ClsService,
    @InjectQueue('audit_logs_queue') private readonly auditQueue: Queue,
  ) {
    dataSource.subscribers.push(this);
  }

  private getContext() {
    return {
      userId: this.cls.get('userId') || 'SYSTEM',
      roleId: this.cls.get('roleId'),
      sessionId: this.cls.get('sessionId'),
      correlationId: this.cls.get('correlationId'),
      ipAddress: this.cls.get('ipAddress'),
      browser: this.cls.get('browser'),
      os: this.cls.get('os'),
      device: this.cls.get('device'),
      endpoint: this.cls.get('endpoint'),
      method: this.cls.get('method'),
      organizationId: this.cls.get('organizationId'),
      branchId: this.cls.get('branchId'),
    };
  }

  private shouldSkipAudit(entityName: string): boolean {
    const skipList = ['AuditLog', 'AuthLog', 'ActivityLog'];
    return skipList.includes(entityName);
  }

  /**
   * Fire-and-forget: dispatches the audit event to the queue WITHOUT blocking
   * the request. If Redis is down, the error is caught and logged — the caller
   * never hangs.
   */
  private dispatchAuditEvent(eventName: string, payload: Record<string, any>): void {
    void this.auditQueue
      .add('audit_event', payload, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
      .catch((err: unknown) => {
        this.logger.warn(
          `[AuditQueue] ${eventName} skipped — Redis unavailable: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
  }

  beforeInsert(event: InsertEvent<any>) {
    if (!event.entity) return;

    // Populate BaseEntity fields
    const userId = this.cls.get('userId');
    if (userId && 'createdByUserId' in event.entity && !event.entity.createdByUserId) {
      event.entity.createdByUserId = userId;
    }
  }

  afterInsert(event: InsertEvent<any>) {
    if (!event.entity) return;
    const entityName = event.metadata.name;

    if (this.shouldSkipAudit(entityName)) return;

    const ctx = this.getContext();
    const payload = {
      ...ctx,
      action: AuditAction.INSERT,
      entityName,
      entityId: event.entity.id,
      versionNumber: event.entity.version || 1,
      newValues: maskData(event.entity),
      changedFields: Object.keys(event.entity),
    };

    this.dispatchAuditEvent('afterInsert', payload);
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (!event.entity || !event.databaseEntity) return;
    const entityName = event.metadata.name;

    // Populate BaseEntity fields
    const userId = this.cls.get('userId');
    if (userId && 'updatedByUserId' in event.entity) {
      event.entity.updatedByUserId = userId;
    }

    if (this.shouldSkipAudit(entityName)) return;

    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};
    const changedFields: string[] = [];

    // Calculate Delta
    for (const column of event.metadata.columns) {
      const propertyName = column.propertyName;
      const oldValue = event.databaseEntity[propertyName];
      const newValue = event.entity[propertyName];

      if (newValue !== undefined && oldValue !== newValue) {
        changedFields.push(propertyName);
        oldValues[propertyName] = oldValue;
        newValues[propertyName] = newValue;
      }
    }

    if (changedFields.length === 0) return; // No actual changes

    const ctx = this.getContext();
    const payload = {
      ...ctx,
      action: AuditAction.UPDATE,
      entityName,
      entityId: event.databaseEntity.id,
      versionNumber: (event.entity.version || event.databaseEntity.version || 0) + 1,
      oldValues: maskData(oldValues),
      newValues: maskData(newValues),
      changedFields,
    };

    this.dispatchAuditEvent('beforeUpdate', payload);
  }

  beforeSoftRemove(event: SoftRemoveEvent<any>) {
    if (!event.entity || !event.databaseEntity) return;
    const entityName = event.metadata.name;

    // Populate BaseEntity fields
    const userId = this.cls.get('userId');
    if (userId && 'deletedByUserId' in event.entity) {
      event.entity.deletedByUserId = userId;
    }

    if (this.shouldSkipAudit(entityName)) return;

    const ctx = this.getContext();
    const payload = {
      ...ctx,
      action: AuditAction.SOFT_DELETE,
      entityName,
      entityId: event.databaseEntity.id,
      versionNumber: (event.entity.version || event.databaseEntity.version || 0) + 1,
      changedFields: ['deletedAt', 'deletedByUserId'],
    };

    this.dispatchAuditEvent('beforeSoftRemove', payload);
  }

  beforeRecover(event: SoftRemoveEvent<any>) {
    if (!event.entity || !event.databaseEntity) return;
    const entityName = event.metadata.name;

    // Populate BaseEntity fields
    const userId = this.cls.get('userId');
    if (userId && 'updatedByUserId' in event.entity) {
      event.entity.updatedByUserId = userId;
    }

    if (this.shouldSkipAudit(entityName)) return;

    const ctx = this.getContext();
    const payload = {
      ...ctx,
      action: AuditAction.RESTORE,
      entityName,
      entityId: event.databaseEntity.id,
      versionNumber: (event.entity.version || event.databaseEntity.version || 0) + 1,
      changedFields: ['deletedAt', 'updatedByUserId'],
    };

    this.dispatchAuditEvent('beforeRecover', payload);
  }
}
