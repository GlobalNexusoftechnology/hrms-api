import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { PermissionEnum } from '../../../common/enums/permission.enum';
import { DataScopeEnum } from '../../../common/enums/data-scope.enum';
import { MAX_AUTHORITY_LEVEL } from '../constants/role.constants';

@Injectable()
export class RBACInitializerService {
  private readonly logger = new Logger(RBACInitializerService.name);

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
        description: 'System Administrator with full access',
        isActive: true,
        isProtected: true,
        isSystem: true,
        authorityLevel: MAX_AUTHORITY_LEVEL,
        dataScope: DataScopeEnum.ORGANIZATION,
      });
      await queryRunner.manager.save(Role, superAdminRole);
      this.logger.log('RBAC Initialization: SUPER_ADMIN role created.');
    } else {
      let needsSave = false;
      if (!superAdminRole.isProtected) {
        superAdminRole.isProtected = true;
        needsSave = true;
      }
      if (!superAdminRole.isSystem) {
        superAdminRole.isSystem = true;
        needsSave = true;
      }
      if (superAdminRole.authorityLevel !== MAX_AUTHORITY_LEVEL) {
        superAdminRole.authorityLevel = MAX_AUTHORITY_LEVEL;
        needsSave = true;
      }
      if (superAdminRole.dataScope !== DataScopeEnum.ORGANIZATION) {
        superAdminRole.dataScope = DataScopeEnum.ORGANIZATION;
        needsSave = true;
      }
      if (needsSave) {
        await queryRunner.manager.save(Role, superAdminRole);
      }
      this.logger.log('RBAC Initialization: SUPER_ADMIN role exists, verified constraints.');
    }

    // ── Step 3: Assign ALL permissions to SUPER_ADMIN (idempotent) ──
    const allPermissions = await queryRunner.manager.find(Permission, {
      where: { isActive: true },
    });

    superAdminRole.permissions = allPermissions;
    await queryRunner.manager.save(Role, superAdminRole);

    this.logger.log(
      `RBAC Initialization: ${allPermissions.length} permissions assigned to SUPER_ADMIN.`,
    );

    return superAdminRole;
  }
}
