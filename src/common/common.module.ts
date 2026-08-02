import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataScopeService } from './services/data-scope.service';
import { TenantQueryService } from './services/tenant-query.service';
import { TenantExecutionService } from './services/tenant-execution.service';
import { Tenant } from '../modules/tenant/entities/tenant.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [DataScopeService, TenantQueryService, TenantExecutionService],
  exports: [DataScopeService, TenantQueryService, TenantExecutionService],
})
export class CommonModule {}

