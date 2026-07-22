import { Global, Module } from '@nestjs/common';
import { DataScopeService } from './services/data-scope.service';

@Global()
@Module({
  providers: [DataScopeService],
  exports: [DataScopeService],
})
export class CommonModule {}
