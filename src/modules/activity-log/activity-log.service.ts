import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { SearchActivityLogDto } from './dto/search-activity-log.dto';
import { TenantQueryService } from '../../common/services/tenant-query.service';
import { DataScopeService } from '../../common/services/data-scope.service';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  /**
   * Logs a new activity asynchronously (fire-and-forget).
   */
  logAction(data: Partial<ActivityLog>): void {
    setImmediate(async () => {
      try {
        const newLog = this.activityLogRepository.create(data);
        await this.activityLogRepository.save(newLog);
      } catch (error) {
        this.logger.error(
          `Failed to save activity log: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }

  /**
   * Searches and filters activity logs with pagination.
   */
  async searchLogs(searchDto: SearchActivityLogDto, currentUser?: Employee) {
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

    const queryBuilder: SelectQueryBuilder<ActivityLog> =
      this.activityLogRepository.createQueryBuilder('log');

    this.tenantQueryService.applyTenantFilter(queryBuilder, 'log');

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'log.branchId',
        employee: 'log.userId',
      });
    }

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
      queryBuilder.andWhere('log.requestMethod = :requestMethod', {
        requestMethod,
      });
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
}

