import {
  Injectable,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { TenantOnboardingDto } from '../dto/tenant-onboarding.dto';
import { Tenant } from '../entities/tenant.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { RBACInitializerService } from '../../roles/services/rbac-initializer.service';
import { TenantStatus } from '../../../common/enums/tenant-status.enum';

/**
 * TenantOnboardingService
 *
 * Handles the creation of a new SaaS tenant, including:
 * 1. Creating the Tenant record
 * 2. Seeding RBAC roles specifically for this Tenant
 * 3. Creating the initial Admin Employee (no branch yet — tenant must create Organization first)
 *
 * NOTE: Organization creation is intentionally NOT part of onboarding.
 * The tenant admin logs in and creates the Organization via POST /organization.
 */
@Injectable()
export class TenantOnboardingService {
  private readonly logger = new Logger(TenantOnboardingService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => RBACInitializerService))
    private readonly rbacInitializer: RBACInitializerService,
  ) {}

  async onboardTenant(dto: TenantOnboardingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Starting onboarding for tenant: ${dto.tenantCode}`);

      // ── Guard: Check for duplicates INSIDE the transaction (prevents TOCTOU race) ──
      const existingTenant = await queryRunner.manager.findOne(Tenant, {
        where: { code: dto.tenantCode },
        lock: { mode: 'pessimistic_read' },
      });
      if (existingTenant) {
        throw new ConflictException(
          `Tenant with code '${dto.tenantCode}' already exists.`,
        );
      }

      const normalizedEmail = dto.admin.email.trim().toLowerCase();
      const existingAdmin = await queryRunner.manager.findOne(Employee, {
        where: { email: normalizedEmail },
      });
      if (existingAdmin) {
        throw new ConflictException(
          `User with email '${dto.admin.email}' already exists in the system.`,
        );
      }

      const existingMobile = await queryRunner.manager.findOne(Employee, {
        where: { mobile: dto.admin.mobile },
      });
      if (existingMobile) {
        throw new ConflictException(
          `User with mobile '${dto.admin.mobile}' already exists in the system.`,
        );
      }

      // ── Step 1: Create Tenant ──────────────────────────────────────────────
      const tenant = queryRunner.manager.create(Tenant, {
        name: dto.companyName,
        code: dto.tenantCode,
        status: TenantStatus.ACTIVE,
      });
      await queryRunner.manager.save(Tenant, tenant);
      this.logger.log(`Tenant created: [${tenant.id}]`);

      // ── Step 2: Seed RBAC for this Tenant ──────────────────────────────────
      const superAdminRole = await this.rbacInitializer.seed(
        queryRunner,
        tenant.id,
      );
      this.logger.log(`RBAC initialized. Admin role: [${superAdminRole.id}]`);

      // ── Step 3: Create Admin Employee ──────────────────────────────────────
      // branchId is null — tenant admin must create Organization + Branch first.
      const hashedPassword = await bcrypt.hash(dto.admin.password, 10);

      const adminEmployee = queryRunner.manager.create(Employee, {
        employeeCode: 'EMP-001',
        firstName: dto.admin.firstName,
        lastName: dto.admin.lastName,
        email: normalizedEmail,
        mobile: dto.admin.mobile,
        password: hashedPassword,
        roleId: superAdminRole.id,
        departmentId: null,
        branchId: null,
        isActive: true,
        tenantId: tenant.id,
      });
      await queryRunner.manager.save(Employee, adminEmployee);
      this.logger.log(`Admin created: ${adminEmployee.email}`);

      await queryRunner.commitTransaction();
      this.logger.log('Tenant onboarding transaction committed successfully.');

      return {
        message:
          'Tenant onboarding successful. Admin user can now log in and create their Organization.',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          code: tenant.code,
        },
        admin: {
          id: adminEmployee.id,
          email: adminEmployee.email,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Tenant onboarding failed — rolling back.', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
