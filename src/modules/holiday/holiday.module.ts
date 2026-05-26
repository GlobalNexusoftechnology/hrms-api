import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Holiday])],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
