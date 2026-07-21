
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { RBACInitializerService } from './services/rbac-initializer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService, RBACInitializerService],
  exports: [TypeOrmModule, RBACInitializerService],
})
export class RolesModule { }
