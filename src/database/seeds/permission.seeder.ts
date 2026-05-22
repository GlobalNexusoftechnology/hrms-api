import { DataSource } from 'typeorm';

import { Permission } from '../../modules/permissions/entities/permission.entity';
import { PERMISSIONS } from '../../common/constants/permissions.constant';

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);

  for (const permissionName of PERMISSIONS) {
    const exists = await permissionRepository.findOne({
      where: {
        name: permissionName,
      },
    });

    if (!exists) {
      await permissionRepository.save({
        name: permissionName,
      });
    }
  }

  console.log('Permissions Seeded');
}
