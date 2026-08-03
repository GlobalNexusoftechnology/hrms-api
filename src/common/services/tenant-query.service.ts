import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class TenantQueryService {
  constructor(private readonly cls: ClsService) {}

  /**
   * Applies tenant filtering to a TypeORM SelectQueryBuilder.
   * Throws an error if no tenant context is found.
   */
  applyTenantFilter<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, alias?: string): SelectQueryBuilder<T> {
    const context = this.cls.get<TenantContext>('tenantContext');
    
    if (!context || !context.tenantId) {
      throw new UnauthorizedException('Tenant context is missing for this operation.');
    }
    
    // Allow SUPER_ADMIN (Platform Tenant) to bypass if we define the platform tenant UUID
    if (context.tenantId === '00000000-0000-0000-0000-000000000000') {
      return qb;
    }

    const targetAlias = alias || qb.alias;
    qb.andWhere(`${targetAlias}.tenantId = :tenantId`, { tenantId: context.tenantId });

    return qb;
  }

  /**
   * Helper to return standard TypeORM 'where' clauses for basic repositories
   */
  getTenantWhereClause(): { tenantId: string } {
    const context = this.cls.get<TenantContext>('tenantContext');

    if (!context || !context.tenantId) {
      throw new UnauthorizedException('Tenant context is missing for this operation.');
    }

    return { tenantId: context.tenantId };
  }

  getTenantContext(): TenantContext {
    const context = this.cls.get<TenantContext>('tenantContext');
    if (!context) {
      throw new UnauthorizedException('Tenant context is missing.');
    }
    return context;
  }
}
