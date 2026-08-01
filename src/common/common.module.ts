import { Global, Module } from '@nestjs/common';
import { DataScopeService } from './services/data-scope.service';
import { TenantQueryService } from './services/tenant-query.service';

@Global()
@Module({
  providers: [DataScopeService, TenantQueryService],
  exports: [DataScopeService, TenantQueryService],
})
export class CommonModule {}
