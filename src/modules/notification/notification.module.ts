import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationPreference } from '../notification-preference/entities/notification-preference.entity';
// import { NotificationPreferenceService } from '../../notification-preference/notification-preference.service';
import { NotificationPreferenceModule } from '../notification-preference/notification-preference.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification,NotificationPreference]),NotificationPreferenceModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
