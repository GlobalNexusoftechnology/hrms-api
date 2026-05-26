import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Payroll } from '../payroll/entities/payroll.entity';

import { PayslipController } from './payslip.controller';

import { PayslipService } from './payslip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll])],

  controllers: [PayslipController],

  providers: [PayslipService],
})
export class PayslipModule {}
