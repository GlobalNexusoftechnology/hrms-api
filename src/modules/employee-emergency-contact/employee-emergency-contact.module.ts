import { Module } from '@nestjs/common';
import { EmployeeEmergencyContactController } from './employee-emergency-contact.controller';
import { EmployeeEmergencyContactService } from './employee-emergency-contact.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEmergencyContact])],
  controllers: [EmployeeEmergencyContactController],
  providers: [EmployeeEmergencyContactService],
  exports: [EmployeeEmergencyContactService],
})
export class EmployeeEmergencyContactModule {}
