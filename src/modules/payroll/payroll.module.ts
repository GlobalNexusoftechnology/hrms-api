import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Payroll } from './entities/payroll.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { SalaryStructure } from '../salary-structure/entities/salary-structure.entity';

import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { Leave } from '../attendance/entities/leave.entity';
import { LeavePolicy } from '../leave-policy/entities/leave-policy.entity';
import { LeaveLedger } from '../leave-ledger/entities/leave-ledger.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { WeekendSetting } from '../weekend_settings/entities/weekend_setting.entity';
import { Holiday } from '../holiday/entities/holiday.entity';

import { PayrollController } from './payroll.controller';

import { PayrollService } from './payroll.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      Employee,
      Attendance,
      SalaryStructure,
      LeaveBalance,
      Leave,
      LeavePolicy,
      LeaveLedger,
      WeekendSetting,
      Holiday,
    ]),
    NotificationModule,
  ],

  controllers: [PayrollController],

  providers: [PayrollService],

  exports: [PayrollService],
})
export class PayrollModule {}
