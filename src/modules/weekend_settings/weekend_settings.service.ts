import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWeekendDto } from './dto/create-weekend_setting.dto';
import { WeekendSetting } from './entities/weekend_setting.entity';

@Injectable()
export class WeekendSettingsService {
  constructor(
    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>,
  ) {}

  async create(dto: CreateWeekendDto[]) {
    for (const item of dto) {
      const existing = await this.weekendRepo.findOne({
        where: {
          day: item.day,

          weekNumber: item.weekNumber,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `${item.day} ${item.weekNumber} already exists`,
        );
      }
    }

    return this.weekendRepo.save(dto);
  }

  async findAll() {
    return this.weekendRepo.find({
      order: {
        day: 'ASC',
      },
    });
  }

  async remove(id: string) {
    const weekend = await this.weekendRepo.findOne({
      where: {
        id,
      },
    });

    if (!weekend) {
      throw new NotFoundException('Weekend setting not found');
    }

    await this.weekendRepo.remove(weekend);

    return {
      message: 'Weekend deleted successfully',
    };
  }
}
