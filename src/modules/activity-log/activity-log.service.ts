import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { SearchActivityLogDto } from './dto/search-activity-log.dto';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Logs a new activity asynchronously (fire-and-forget).
   */
  logAction(data: Partial<ActivityLog>): void {
    setImmediate(async () => {
      try {
        // Remove sensitive fields from metadata/oldValue/newValue if they exist
        const sanitizedData = this.sanitizeSensitiveData(data);
        const newLog = this.activityLogRepository.create(sanitizedData);
        await this.activityLogRepository.save(newLog);
      } catch (error) {
        this.logger.error(`Failed to save activity log: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Searches and filters activity logs with pagination.
   */
  async searchLogs(searchDto: SearchActivityLogDto) {
    const {
      userId,
      module,
      entityType,
      entityId,
      action,
      status,
      requestMethod,
      ipAddress,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = searchDto;

    const queryBuilder: SelectQueryBuilder<ActivityLog> = this.activityLogRepository.createQueryBuilder('log');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }
    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }
    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
    }
    if (entityId) {
      queryBuilder.andWhere('log.entityId = :entityId', { entityId });
    }
    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }
    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }
    if (requestMethod) {
      queryBuilder.andWhere('log.requestMethod = :requestMethod', { requestMethod });
    }
    if (ipAddress) {
      queryBuilder.andWhere('log.ipAddress = :ipAddress', { ipAddress });
    }
    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Sorting
    queryBuilder.orderBy(`log.${sortBy}`, sortOrder);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Sanitizes sensitive data before logging.
   */
  private sanitizeSensitiveData(data: Partial<ActivityLog>): Partial<ActivityLog> {
    const sanitized = { ...data };
    
    // Helper to mask properties in JSON objects
    const maskJson = (obj: any) => {
      if (!obj || typeof obj !== 'object') return obj;
      const maskedObj = { ...obj };
      const sensitiveKeys = ['password', 'token', 'otp', 'refreshToken', 'accessToken', 'secret'];
      
      for (const key of Object.keys(maskedObj)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          maskedObj[key] = '********';
        } else if (typeof maskedObj[key] === 'object' && maskedObj[key] !== null) {
          maskedObj[key] = maskJson(maskedObj[key]);
        }
      }
      return maskedObj;
    };

    if (sanitized.oldValue) sanitized.oldValue = maskJson(sanitized.oldValue);
    if (sanitized.newValue) sanitized.newValue = maskJson(sanitized.newValue);
    if (sanitized.metadata) sanitized.metadata = maskJson(sanitized.metadata);

    return sanitized;
  }
}
