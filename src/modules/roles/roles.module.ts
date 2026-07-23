import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RBACInitializerService } from './services/rbac-initializer.service';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), ActivityLogModule],
  controllers: [RolesController],
  providers: [RolesService, RBACInitializerService],
  exports: [TypeOrmModule, RBACInitializerService],
})
export class RolesModule { }
