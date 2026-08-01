import AppDataSource from '../data-source';
import { syncPermissions } from './sync-permissions';

/**
 * Main seed script.
 *
 * NOTE: syncRBAC is intentionally DISABLED.
 * Roles are now tenant-scoped (tenant_id NOT NULL) and are seeded
 * per-tenant automatically during tenant onboarding via RBACInitializerService.
 *
 * Running syncRBAC here would fail with:
 *   "null value in column tenant_id of relation roles"
 *
 * Use: POST /api/tenant/onboard  to create a tenant with its SUPER_ADMIN role.
 */
async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  // Sync global permissions (no tenant_id — permissions are global)
  await syncPermissions(AppDataSource);

  process.exit();
}

seed();
