import { Module } from '@nestjs/common';
import { LeaveTypeService } from './leave-type.service';
import { LeaveTypeController } from './leave-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveType } from './entities/leave-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveType])],
  controllers: [LeaveTypeController],
  providers: [LeaveTypeService],
  exports: [LeaveTypeService],
})
export class LeaveTypeModule {}
