import AppDataSource from '../data-source';
import { seedDefaultData } from './default-data.seed';
import { syncPermissions } from './sync-permissions';
// import { seedDepartmentDesignation } from './department-designation.seed';
import { syncRBAC } from './sync-rbac.seed';
// import { seedTraining } from './training.seeder';
// import { seedBulkEmployees } from './bulk-employee.seeder';

async function seed() {
  await AppDataSource.initialize();

  console.log('Database connected');
  await syncRBAC(AppDataSource);
  // await seedDepartmentDesignation(AppDataSource);
  await seedDefaultData(AppDataSource);
  // await seedTraining(AppDataSource);
  // await seedBulkEmployees(AppDataSource);
  await syncPermissions(AppDataSource);

  process.exit();
}

seed();
