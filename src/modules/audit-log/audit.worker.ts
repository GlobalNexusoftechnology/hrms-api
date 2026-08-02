import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Processor('audit_logs_queue')
export class AuditWorker extends WorkerHost {
  private readonly logger = new Logger(AuditWorker.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly cls: ClsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const tenantContext = job.data?.tenantContext || (job.data?.tenantId ? { tenantId: job.data.tenantId } : null);

    const executeJob = async () => {
      try {
        const auditData = job.data;
        const newAudit = this.auditLogRepository.create(auditData);
        await this.auditLogRepository.save(newAudit);
      } catch (error) {
        this.logger.error(
          `Failed to process audit log job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    };

    if (tenantContext) {
      return this.cls.run(async () => {
        this.cls.set('tenantContext', tenantContext);
        return executeJob();
      });
    } else {
      return executeJob();
    }
  }
}
