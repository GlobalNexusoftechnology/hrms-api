import { Module } from '@nestjs/common';
import { LeavePolicyService } from './leave-policy.service';
import { LeavePolicyController } from './leave-policy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavePolicy } from './entities/leave-policy.entity';
import { LeaveType } from '../leave-type/entities/leave-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeavePolicy, LeaveType])],
  controllers: [LeavePolicyController],
  providers: [LeavePolicyService],
  exports: [LeavePolicyService],
})
export class LeavePolicyModule {}
