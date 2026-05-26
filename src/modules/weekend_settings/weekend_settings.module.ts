import { Module } from '@nestjs/common';
import { WeekendSettingsService } from './weekend_settings.service';
import { WeekendSettingsController } from './weekend_settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeekendSetting } from './entities/weekend_setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeekendSetting])],
  controllers: [WeekendSettingsController],
  providers: [WeekendSettingsService],
})
export class WeekendSettingsModule {}
