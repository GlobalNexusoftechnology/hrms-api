import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Logger } from '@nestjs/common';

@Processor('audit_logs_queue')
export class AuditWorker extends WorkerHost {
  private readonly logger = new Logger(AuditWorker.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      const auditData = job.data;
      const newAudit = this.auditLogRepository.create(auditData);
      await this.auditLogRepository.save(newAudit);
    } catch (error) {
      this.logger.error(
        `Failed to process audit log job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      
      // Implement DLQ Pattern: 
      // If it fails after all retries (which BullMQ handles if configured),
      // we log it as a critical failure for manual intervention.
      
      throw error; // Let BullMQ handle retries and move to 'failed' state
    }
  }

}
