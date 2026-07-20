import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { PermissionEnum } from '../../../common/enums/permission.enum';

/**
 * RBACInitializerService — lives in the Roles/RBAC module.
 * Responsible for seeding all permissions and creating the protected SUPER_ADMIN role.
 *
 * Idempotent: safe to call multiple times (won't create duplicates).
 * Must receive an active QueryRunner from the caller's transaction.
 */
@Injectable()
export class RBACInitializerService {
  private readonly logger = new Logger(RBACInitializerService.name);

  /**
   * Seeds all permissions from PermissionEnum, creates the protected SUPER_ADMIN role,
   * and assigns all permissions to it.
   *
   * @param queryRunner - Active QueryRunner from the caller's DB transaction
   * @returns The SUPER_ADMIN Role record
   */
  async seed(queryRunner: QueryRunner): Promise<Role> {
    this.logger.log('RBAC Initialization: Seeding permissions...');

    // ── Step 1: Seed all PermissionEnum values (idempotent) ──
    const allPermissionNames = Object.values(PermissionEnum);

    for (const permName of allPermissionNames) {
      const existing = await queryRunner.manager.findOne(Permission, {
        where: { name: permName },
      });

      if (!existing) {
        const perm = queryRunner.manager.create(Permission, {
          name: permName,
          description: null,
          isActive: true,
        });
        await queryRunner.manager.save(Permission, perm);
      }
    }

    this.logger.log(`RBAC Initialization: ${allPermissionNames.length} permissions seeded.`);

    // ── Step 2: Find or create SUPER_ADMIN role (idempotent) ──
    let superAdminRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'SUPER_ADMIN' },
      relations: { permissions: true },
    });

    if (!superAdminRole) {
      superAdminRole = queryRunner.manager.create(Role, {
        name: 'SUPER_ADMIN',
        isActive: true,
        isProtected: true, // Cannot be deleted, renamed, deactivated, or stripped of permissions
      });
      await queryRunner.manager.save(Role, superAdminRole);
      this.logger.log('RBAC Initialization: SUPER_ADMIN role created.');
    } else {
      // Ensure it's always marked protected (in case migration ran before this flag existed)
      if (!superAdminRole.isProtected) {
        superAdminRole.isProtected = true;
        await queryRunner.manager.save(Role, superAdminRole);
      }
      this.logger.log('RBAC Initialization: SUPER_ADMIN role already exists, skipping creation.');
    }

    // ── Step 3: Assign ALL permissions to SUPER_ADMIN (idempotent) ──
    const allPermissions = await queryRunner.manager.find(Permission, {
      where: { isActive: true },
    });

    // Overwrite the permissions relation with the full set (safe even if already assigned)
    superAdminRole.permissions = allPermissions;
    await queryRunner.manager.save(Role, superAdminRole);

    this.logger.log(
      `RBAC Initialization: ${allPermissions.length} permissions assigned to SUPER_ADMIN.`,
    );

    return superAdminRole;
  }
}
