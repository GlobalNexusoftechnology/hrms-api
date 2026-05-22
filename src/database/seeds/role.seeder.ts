import { DataSource } from 'typeorm';

import { Role } from '../../modules/roles/entities/role.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const roles = ['Super Admin', 'HR', 'Employee'];

  for (const roleName of roles) {
    const exists = await roleRepository.findOne({
      where: {
        name: roleName,
      },
    });

    if (!exists) {
      await roleRepository.save({
        name: roleName,
      });
    }
  }

  console.log('Roles Seeded');
}
