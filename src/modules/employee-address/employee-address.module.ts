import { Module } from '@nestjs/common';
import { EmployeeAddressController } from './employee-address.controller';
import { EmployeeAddressService } from './employee-address.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAddress } from './entities/employee-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeAddress])],
  controllers: [EmployeeAddressController],
  providers: [EmployeeAddressService],
  exports: [EmployeeAddressService],
})
export class EmployeeAddressModule {}
