import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Attendance } from './entities/attendance.entity';
import { AttendanceCorrection } from './entities/correction.entity';
import { Leave } from './entities/leave.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Holiday } from '../holiday/entities/holiday.entity';

import { WeekendSetting } from '../weekend_settings/entities/weekend_setting.entity';

// CONTROLLERS
import { AttendanceController } from './Controller/attendance.controller';
import { HrAttendanceController } from './Controller/hr-attendance.controller';
import { CorrectionController } from './Controller/correction.controller';
import { LeaveController } from './Controller/leave-controller.controller';
import { HrLeaveController } from './Controller/hr-leave-controller.controller';

// SERVICES
import { AttendanceService } from './Service/attendance.service';
import { AttendanceQueryService } from './Service/attendance-query.service';
import { AttendanceDashboardService } from './Service/attendance-dashboard.service';
import { AttendanceCronService } from './Service/attendance-cron.service';
import { AttendanceValidationService } from './Service/attendance-validation.service';

import { CorrectionService } from './Service/correction.service';
import { LeaveService } from './Service/leave.service';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { LeaveBalanceModule } from '../leave-balance/leave-balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendanceCorrection,
      Employee,
      Leave,
      Holiday,
      WeekendSetting,
      LeaveBalance,
    ]),
    LeaveBalanceModule,
  ],

  controllers: [
    AttendanceController,
    HrAttendanceController,
    CorrectionController,
    LeaveController,
    HrLeaveController,
  ],

  providers: [
    AttendanceService,
    AttendanceQueryService,
    AttendanceDashboardService,
    AttendanceCronService,
    AttendanceValidationService,
    CorrectionService,
    LeaveService,
  ],

  exports: [
    AttendanceService,
    AttendanceQueryService,
    AttendanceDashboardService,
    AttendanceValidationService,
    LeaveService,
  ],
})
export class AttendanceModule {}
