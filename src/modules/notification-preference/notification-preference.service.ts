import { Injectable } from '@nestjs/common';

import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private preferenceRepo: Repository<NotificationPreference>,
  ) {}
  async getPreferences(employee: any) {
    let preference = await this.preferenceRepo.findOne({
      where: {
        employeeId: employee.id,
      },
    });

    if (!preference) {
      preference = await this.preferenceRepo.save({
        employeeId: employee.id,
      });
    }

    return preference;
  }

  async updatePreferences(
    employee: any,

    dto: UpdateNotificationPreferenceDto,
  ) {
    let preference = await this.preferenceRepo.findOne({
      where: {
        employeeId: employee.id,
      },
    });

    if (!preference) {
      preference = this.preferenceRepo.create({
        employeeId: employee.id,
      });
    }

    Object.assign(preference, dto);

    const saved = await this.preferenceRepo.save(preference);

    return saved;
  }
}
