import { Injectable, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { BootstrapSystemDto } from '../dto/bootstrap.dto';
import { SystemConfig } from '../entities/system-config.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { RBACInitializerService } from '../../roles/services/rbac-initializer.service';

const BOOTSTRAP_FLAG = 'system.bootstrapped';

/**
 * BootstrapService — Progressive Setup Orchestrator.
 *
 * This service executes the "Progressive Setup" architecture:
 * It ONLY seeds RBAC permissions and creates the very first SUPER_ADMIN user.
 * 
 * The system considers itself "bootstrapped" once this user exists. The rest of the 
 * organization profile (Address, Tax, Branches, etc.) will be completed by this user 
 * via standard protected APIs (the frontend wizard).
 *
 * Transaction Order:
 *   1. Guard: reject if already bootstrapped (idempotent)
 *   2. RBAC: Seed permissions + create SUPER_ADMIN role (delegated to RBACInitializerService)
 *   3. Chairman Employee (EMP-001, SUPER_ADMIN role)
 *   4. Mark system.bootstrapped = true in system_config
 */
@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => RBACInitializerService))
    private readonly rbacInitializer: RBACInitializerService,
  ) {}

  async bootstrap(dto: BootstrapSystemDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // ── Guard: Check if already bootstrapped ──────────────────────────────────
    const existingFlag = await queryRunner.manager.findOne(SystemConfig, {
      where: { key: BOOTSTRAP_FLAG },
    });

    if (existingFlag?.value === 'true') {
      await queryRunner.release();
      throw new ConflictException(
        'System is already initialized. Bootstrap can only be run once. ' +
        'Please log in with the Chairman credentials to continue the setup process.',
      );
    }

    await queryRunner.startTransaction();

    try {
      this.logger.log('Bootstrap transaction started.');

      // ── Step 1: RBAC Initialization (delegated to RBACInitializerService) ────
      const superAdminRole = await this.rbacInitializer.seed(queryRunner);
      this.logger.log(`RBAC initialized. SUPER_ADMIN role: [${superAdminRole.id}]`);

      // ── Step 2: Chairman Employee ────────────────────────────────────────────
      const latestEmployee = await queryRunner.manager.find(Employee, {
        order: { createdAt: 'DESC' },
        take: 1,
      });

      let nextNumber = 1;
      if (latestEmployee.length > 0 && latestEmployee[0].employeeCode) {
        const lastNumber = Number.parseInt(latestEmployee[0].employeeCode.split('-')[1], 10);
        if (!Number.isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      const employeeCode = `EMP-${String(nextNumber).padStart(3, '0')}`;

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Idempotent: check if chairman email already exists
      const existingChairman = await queryRunner.manager.findOne(Employee, {
        where: { email: dto.email.trim().toLowerCase() },
      });

      let chairman: Employee;
      if (existingChairman) {
        this.logger.warn(`Chairman employee already exists: ${existingChairman.email}. Skipping creation.`);
        chairman = existingChairman;
      } else {
        chairman = queryRunner.manager.create(Employee, {
          employeeCode,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email.trim().toLowerCase(),
          mobile: dto.mobile,
          password: hashedPassword,
          roleId: superAdminRole.id,
          isActive: true,
        });
        await queryRunner.manager.save(Employee, chairman);
        this.logger.log(`Chairman employee created: ${chairman.email} [${chairman.employeeCode}]`);
      }

      // ── Step 3: Mark system as bootstrapped ──────────────────────────────────
      const configFlag = queryRunner.manager.create(SystemConfig, {
        key: BOOTSTRAP_FLAG,
        value: 'true',
        description: 'Set by the bootstrap process. Do not modify manually.',
      });
      await queryRunner.manager.save(SystemConfig, configFlag);

      await queryRunner.commitTransaction();
      this.logger.log('Bootstrap transaction committed successfully.');

      return {
        message: 'System initialized successfully. You can now log in with these credentials to complete the Organization Setup.',
        chairmanEmployee: {
          id: chairman.id,
          employeeCode: chairman.employeeCode,
          email: chairman.email,
        },
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Bootstrap failed — transaction rolled back.', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
