import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Payroll } from './entities/payroll.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { SalaryStructure } from '../salary-structure/entities/salary-structure.entity';

import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { WeekendSetting } from '../weekend_settings/entities/weekend_setting.entity';

import { PayrollController } from './payroll.controller';

import { PayrollService } from './payroll.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payroll,
      Employee,
      Attendance,
      SalaryStructure,
      LeaveBalance,
      WeekendSetting,
    ]),
  ],

  controllers: [PayrollController],

  providers: [PayrollService],

  exports: [PayrollService],
})
export class PayrollModule {}
