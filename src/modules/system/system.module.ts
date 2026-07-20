import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemController } from './system.controller';
import { BootstrapService } from './services/bootstrap.service';
import { SystemConfig } from './entities/system-config.entity';

import { RolesModule } from '../roles/roles.module';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig,
      Employee,
    ]),
    RolesModule,
  ],
  controllers: [SystemController],
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class SystemModule {}
