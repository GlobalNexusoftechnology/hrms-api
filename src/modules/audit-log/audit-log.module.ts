import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditSubscriber } from './audit.subscriber';
import { BullModule } from '@nestjs/bullmq';
import { AuditWorker } from './audit.worker';
import { AuditArchivalService } from './audit-archival.service';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({
      name: 'audit_logs_queue',
    }),
  ],
  controllers: [AuditLogController],
  providers: [AuditSubscriber, AuditWorker, AuditArchivalService, AuditLogService],
  exports: [AuditSubscriber, AuditLogService],
})
export class AuditLogModule {}
