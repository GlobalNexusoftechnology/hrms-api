import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Employee } from '../employees/entities/employee.entity';

import { LeaveBalance } from './entities/leave-balance.entity';

import { LeaveBalanceService } from './leave-balance.service';

import { LeaveBalanceController } from './leave-balance.controller';
import { Leave } from '../attendance/entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveBalance, Employee, Leave])],

  controllers: [LeaveBalanceController],

  providers: [LeaveBalanceService],

  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
