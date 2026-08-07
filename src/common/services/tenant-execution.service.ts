import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { Tenant } from '../../modules/tenant/entities/tenant.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class TenantExecutionService {
  private readonly logger = new Logger(TenantExecutionService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly cls: ClsService,
  ) {}

  /**
   * Discovers all ACTIVE tenants from the database and executes a callback for each tenant
   * within an isolated CLS context and isolated try/catch block.
   *
   * @param taskName Human-readable operation identifier for logging
   * @param callback Async execution block receiving the tenant object
   */
  async forEachActiveTenant(
    taskName: string,
    callback: (tenant: Tenant) => Promise<void>,
  ): Promise<{ processed: number; succeeded: number; failed: number }> {
    const activeTenants = await this.tenantRepository.find({
      where: { status: TenantStatus.ACTIVE },
    });

    this.logger.log(
      `[${taskName}] Starting batch execution across ${activeTenants.length} active tenant(s)...`,
    );

    let succeeded = 0;
    let failed = 0;

    for (const tenant of activeTenants) {
      const tenantContext: TenantContext = {
        tenantId: tenant.id,
        userId: 'SYSTEM_CRON',
        roleId: 'SYSTEM',
      };

      try {
        await this.cls.run(async () => {
          this.cls.set('tenantContext', tenantContext);
          await callback(tenant);
        });
        succeeded++;
      } catch (error) {
        failed++;
        this.logger.error(
          `[${taskName}] Failed execution for tenant '${tenant.code}' (${tenant.id}): ${
            error instanceof Error ? error.message : String(error)
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    this.logger.log(
      `[${taskName}] Batch execution completed. Total: ${activeTenants.length}, Succeeded: ${succeeded}, Failed: ${failed}`,
    );

    return {
      processed: activeTenants.length,
      succeeded,
      failed,
    };
  }
}
