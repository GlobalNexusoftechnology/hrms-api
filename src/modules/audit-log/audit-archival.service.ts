import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditArchivalService {
  private readonly logger = new Logger(AuditArchivalService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Automatically create a new partition for the next month.
   * Runs at midnight on the 25th of every month.
   */
  @Cron('0 0 25 * *')
  async createNextMonthPartition() {
    this.logger.log('Running automated partition creation cron job...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0'); // 1-indexed month
    
    // Calculate the start of the next month and the month after that
    const startDate = `${year}-${month}-01`;
    
    const endMonthDate = new Date(year, nextMonth.getMonth() + 1, 1);
    const endYear = endMonthDate.getFullYear();
    const endMonth = String(endMonthDate.getMonth() + 1).padStart(2, '0');
    const endDate = `${endYear}-${endMonth}-01`;

    const partitionName = `audit_logs_y${year}m${month}`;

    const query = `
      CREATE TABLE IF NOT EXISTS ${partitionName} 
      PARTITION OF audit_logs 
      FOR VALUES FROM ('${startDate}') TO ('${endDate}');
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`Successfully created partition: ${partitionName}`);
    } catch (error) {
      this.logger.error(`Failed to create partition ${partitionName}:`, error);
    }
  }

  /**
   * Archive partitions older than 7 years (84 months).
   * Runs on the 1st of every month.
   * In a true enterprise scenario, we might move this to cold storage (S3) and drop the partition.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async archiveOldPartitions() {
    this.logger.log('Running audit log archival check...');
    
    // Calculate date 7 years ago
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() - 7);
    
    const year = retentionDate.getFullYear();
    const month = String(retentionDate.getMonth() + 1).padStart(2, '0');
    
    const partitionName = `audit_logs_y${year}m${month}`;
    
    this.logger.log(`Checking for old partition to archive/drop: ${partitionName}`);
    
    try {
      // Check if table exists
      const tableCheck = await this.dataSource.query(`
        SELECT to_regclass('${partitionName}') as exists;
      `);
      
      if (tableCheck[0]?.exists) {
        // Ideally export to S3 via pg_dump or COPY before dropping
        // For this phase, we simply detach or drop it based on policy
        await this.dataSource.query(`DROP TABLE ${partitionName};`);
        this.logger.log(`Successfully dropped archived partition: ${partitionName}`);
      } else {
        this.logger.log(`Partition ${partitionName} does not exist. Nothing to archive.`);
      }
    } catch (error) {
      this.logger.error(`Error during archival of ${partitionName}:`, error);
    }
  }
}
