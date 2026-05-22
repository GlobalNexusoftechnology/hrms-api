import { Module } from '@nestjs/common';
import { AttendanceService } from './Service/attendance.service';
import { AttendanceController } from './Controller/attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceCorrection } from './entities/correction.entity';
import { Employee } from '../employees/entities/employee.entity';
import { HrAttendanceController } from './Controller/hr-attendance.controller';




import { CorrectionController } from './Controller/correction.controller';
import { HrLeaveController } from './Controller/hr-leave-controller.controller';
import { LeaveController } from './Controller/leave-controller.controller';
import { LeaveService } from './Service/leave.service';
import { Leave } from './entities/leave.entity';
import { CorrectionService } from './Service/correction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceCorrection, Employee, Leave]),
  ],
  controllers: [AttendanceController, HrAttendanceController,CorrectionController,LeaveController, HrLeaveController],
  providers: [AttendanceService, CorrectionService,LeaveService],
})
export class AttendanceModule {}
