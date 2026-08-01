import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { TenantQueryService } from '../../common/services/tenant-query.service';
import { DataScopeService } from '../../common/services/data-scope.service';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async findAll(query: any = {}, currentUser?: Employee) {
    const { page = 1, limit = 10, entityName, entityId, userId, action } = query;
    const qb = this.auditLogRepository.createQueryBuilder('audit');

    this.tenantQueryService.applyTenantFilter(qb, 'audit');

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'audit.branchId',
        employee: 'audit.userId',
      });
    }

    if (entityName) {
      qb.andWhere('audit.entityName = :entityName', { entityName });
    }
    if (entityId) {
      qb.andWhere('audit.entityId = :entityId', { entityId });
    }
    if (userId) {
      qb.andWhere('audit.userId = :userId', { userId });
    }
    if (action) {
      qb.andWhere('audit.action = :action', { action });
    }

    qb.orderBy('audit.createdAt', 'DESC');
    
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}
