import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';

import { DashboardService } from './dashboard.service';

import { Employee } from '../employees/entities/employee.entity';

import { Department } from '../departments/entities/department.entity';

import { Attendance } from '../attendance/entities/attendance.entity';

import { Candidate } from '../interview/entities/candidate.entity';

import { Training } from '../training/entities/training.entity';
import { Leave } from '../attendance/entities/leave.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Attendance,
      Leave,
      Candidate,
      Training,
    ]),
  ],

  controllers: [DashboardController],

  providers: [DashboardService],
})
export class DashboardModule {}
