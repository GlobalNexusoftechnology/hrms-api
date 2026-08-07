import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantService } from './tenant.service';
import { TenantOnboardingService } from './services/tenant-onboarding.service';
import { TenantOnboardingController } from './controllers/tenant-onboarding.controller';
import { TenantController } from './controllers/tenant.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    forwardRef(() => RolesModule),
  ],
  controllers: [TenantOnboardingController, TenantController],
  providers: [TenantService, TenantOnboardingService],
  exports: [TenantService, TenantOnboardingService, TypeOrmModule],
})
export class TenantModule {}
