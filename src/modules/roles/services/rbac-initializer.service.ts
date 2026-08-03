import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { PermissionEnum } from '../../../common/enums/permission.enum';
import { DataScopeEnum } from '../../../common/enums/data-scope.enum';
import { MAX_AUTHORITY_LEVEL } from '../constants/role.constants';
import { RBAC_CONFIG } from '../../../common/constants/rbac.config';
import { RoleEnum } from '../../../common/enums/role.enum';

@Injectable()
export class RBACInitializerService {
  private readonly logger = new Logger(RBACInitializerService.name);

  async seed(queryRunner: QueryRunner, tenantId: string): Promise<Role> {
    this.logger.log(
      `RBAC Initialization: Seeding permissions and default roles for tenant ${tenantId}...`,
    );

    // ── Step 1: Seed all PermissionEnum values (idempotent - global) ──
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

    this.logger.log(
      `RBAC Initialization: ${allPermissionNames.length} permissions verified globally.`,
    );

    let superAdminRole!: Role;

    // ── Step 2: Seed configured default roles (SUPER_ADMIN, HR, EMPLOYEE) ──
    for (const [roleName, permissionList] of Object.entries(RBAC_CONFIG)) {
      const isSuperAdmin = roleName === RoleEnum.SUPER_ADMIN;
      const isHR = roleName === RoleEnum.HR;

      const targetDataScope = isSuperAdmin
        ? DataScopeEnum.ORGANIZATION
        : isHR
        ? DataScopeEnum.BRANCH
        : DataScopeEnum.SELF;

      const targetAuthorityLevel = isSuperAdmin
        ? MAX_AUTHORITY_LEVEL
        : isHR
        ? 50
        : 10;

      const targetDescription = isSuperAdmin
        ? 'System Administrator with full access'
        : isHR
        ? 'Human Resources Manager'
        : 'Standard Employee with self-service access';

      let role = await queryRunner.manager.findOne(Role, {
        where: { name: roleName, tenantId },
        relations: { permissions: true },
      });

      if (!role) {
        role = queryRunner.manager.create(Role, {
          name: roleName,
          description: targetDescription,
          isActive: true,
          isProtected: isSuperAdmin,
          isSystem: true,
          authorityLevel: targetAuthorityLevel,
          dataScope: targetDataScope,
          tenantId,
        });
        await queryRunner.manager.save(Role, role);
        this.logger.log(
          `RBAC Initialization: ${roleName} role created for tenant [${tenantId}].`,
        );
      } else {
        let needsSave = false;
        if (role.isProtected !== isSuperAdmin) {
          role.isProtected = isSuperAdmin;
          needsSave = true;
        }
        if (!role.isSystem) {
          role.isSystem = true;
          needsSave = true;
        }
        if (role.authorityLevel !== targetAuthorityLevel) {
          role.authorityLevel = targetAuthorityLevel;
          needsSave = true;
        }
        if (role.dataScope !== targetDataScope) {
          role.dataScope = targetDataScope;
          needsSave = true;
        }
        if (needsSave) {
          await queryRunner.manager.save(Role, role);
        }
      }

      // Assign configured permissions from RBAC_CONFIG
      const rolePermissions = await queryRunner.manager.find(Permission, {
        where: { name: In(permissionList as string[]), isActive: true },
      });

      role.permissions = rolePermissions;
      await queryRunner.manager.save(Role, role);
      this.logger.log(
        `RBAC Initialization: ${rolePermissions.length} permissions assigned to ${roleName}.`,
      );

      if (isSuperAdmin) {
        superAdminRole = role;
      }
    }

    if (!superAdminRole) {
      throw new Error(
        'RBAC Initialization failed: SUPER_ADMIN role was not created.',
      );
    }

    return superAdminRole;
  }
}

