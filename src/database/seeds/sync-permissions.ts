import { DataSource } from 'typeorm';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { PermissionEnum } from '../../common/enums/permission.enum';
import AppDataSource from '../data-source';

export async function syncPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const existingPermissions = await permissionRepo.find();
  const permissionMap = new Map(existingPermissions.map((p) => [p.name, p]));

  let addedCount = 0;
  const allPermissionNames = Object.values(PermissionEnum);

  for (const permName of allPermissionNames) {
    if (!permissionMap.has(permName)) {
      await permissionRepo.save({ name: permName, isActive: true });
      console.log(`+ Added new permission: ${permName}`);
      addedCount++;
    }
  }

  console.log(`Sync complete. Added ${addedCount} new permissions.`);
}

async function run() {
  await AppDataSource.initialize();
  console.log('Database connected.');
  await syncPermissions(AppDataSource);
  process.exit();
}

// Only run automatically if executed directly from terminal
if (require.main === module) {
  run();
}
