import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';

import { DashboardService } from './dashboard.service';

import { Employee } from '../employees/entities/employee.entity';

import { Department } from '../departments/entities/department.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { Candidate } from '../interview/entities/candidate.entity';

import { Course } from '../training/entities/course.entity';
import { Leave } from '../attendance/entities/leave.entity';
import { Payroll } from '../payroll/entities/payroll.entity';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { Holiday } from '../holiday/entities/holiday.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Attendance,
      Leave,
      Candidate,
      Course,
      Payroll,
      LeaveBalance,
      Holiday,
    ]),
  ],

  controllers: [DashboardController],

  providers: [DashboardService],
})
export class DashboardModule {}
