import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeBankService } from './employee-bank.service';
import { EmployeeBankController } from './employee-bank.controller';
import { EmployeeBank } from './entities/employee-bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeBank])],
  controllers: [EmployeeBankController],
  providers: [EmployeeBankService],
  exports: [EmployeeBankService],
})
export class EmployeeBankModule {}
