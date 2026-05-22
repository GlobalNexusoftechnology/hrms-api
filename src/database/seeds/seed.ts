import AppDataSource from '../data-source';
import { seedDefaultData } from './default-data.seed';
import { syncRBAC } from './sync-rbac.seed';

async function seed() {
  await AppDataSource.initialize();

  console.log('Database connected');
  await syncRBAC(AppDataSource);
  await seedDefaultData(AppDataSource);

  process.exit();
}

seed();
