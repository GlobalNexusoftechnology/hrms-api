
import { RBAC_CONFIG } from "../../common/constants/rbac.config";
import { Permission } from "../../modules/permissions/entities/permission.entity";
import { Role } from "../../modules/roles/entities/role.entity";
import { DataSource } from "typeorm";

export async function syncRBAC(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);

  const existingRoles = await roleRepo.find({
    relations: {
      permissions: true,
    },
  });

  const existingPermissions = await permissionRepo.find();

  const roleMap = new Map(existingRoles.map((r) => [r.name, r]));

  const permissionMap = new Map(existingPermissions.map((p) => [p.name, p]));

  for (const [roleName, permissionNames] of Object.entries(RBAC_CONFIG)) {
    let role = roleMap.get(roleName);

    if (!role) {
      role = await roleRepo.save({
        name: roleName,
      });

      roleMap.set(roleName, role);
    }

    const permissions: Permission[] = [];

    for (const permissionName of permissionNames) {
      let permission = permissionMap.get(permissionName);

      if (!permission) {
        permission = await permissionRepo.save({
          name: permissionName,
        });

        permissionMap.set(permissionName, permission);
      }

      permissions.push(permission);
    }

    role.permissions = permissions;

    await roleRepo.save(role);
  }

  console.log('RBAC synced');
}
