import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, entityName, entityId, userId, action } = query;
    const qb = this.auditLogRepository.createQueryBuilder('audit');

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
