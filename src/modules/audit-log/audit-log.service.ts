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
    const { page = 1, limit = 10, search, module, entityName, entityId, userId, action } = query;
    const qb = this.auditLogRepository.createQueryBuilder('audit');

    this.tenantQueryService.applyTenantFilter(qb, 'audit');
    qb.leftJoinAndSelect(Employee, 'employee', 'employee.id::text = audit.userId');

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'audit.branchId',
        employee: 'audit.userId',
      });
    }

    if (search) {
      qb.andWhere(
        '(audit.entityName ILIKE :search OR audit.endpoint ILIKE :search OR audit.reason ILIKE :search OR audit.ipAddress ILIKE :search OR employee.first_name ILIKE :search OR employee.last_name ILIKE :search OR employee.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (module || entityName) {
      qb.andWhere('(audit.entityName ILIKE :mod OR audit.endpoint ILIKE :mod)', { mod: `%${module || entityName}%` });
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
    
    qb.skip((Number(page) - 1) * Number(limit));
    qb.take(Number(limit));

    const [data, total] = await qb.getManyAndCount();

    const mappedItems = data.map((item: any) => {
      const emp = item.employee;
      return {
        ...item,
        user: emp ? {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          employeeCode: emp.employeeCode,
        } : null,
        userEmail: emp?.email || null,
        userName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : (item.userId || 'System'),
      };
    });

    return {
      data: mappedItems,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
