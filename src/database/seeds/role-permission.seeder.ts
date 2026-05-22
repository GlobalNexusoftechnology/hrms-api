import { DataSource } from 'typeorm';

import { Role } from '../../modules/roles/entities/role.entity';

import { Permission } from '../../modules/permissions/entities/permission.entity';

export async function seedRolePermissions(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const permissionRepository = dataSource.getRepository(Permission);

  const superAdmin = await roleRepository.findOne({
    where: {
      name: 'Super Admin',
    },
    relations: {
      permissions: true,
    },
  });

  const employeeRole = await roleRepository.findOne({
    where: {
      name: 'Employee',
    },
    relations: {
      permissions: true,
    },
  });

  const allPermissions = await permissionRepository.find();

  // SUPER ADMIN
  if (superAdmin) {
    superAdmin.permissions = allPermissions;

    await roleRepository.save(superAdmin);
  }

  // EMPLOYEE ROLE
  if (employeeRole) {
    const employeePermissions = allPermissions.filter((permission) =>
      ['employee.read'].includes(permission.name),
    );

    employeeRole.permissions = employeePermissions;

    await roleRepository.save(employeeRole);
  }

  console.log('Role Permissions seeded');
}
