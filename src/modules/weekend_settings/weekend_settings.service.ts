import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWeekendDto } from './dto/create-weekend_setting.dto';
import { WeekendSetting } from './entities/weekend_setting.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";

@Injectable()
export class WeekendSettingsService {
  constructor(
    @InjectRepository(WeekendSetting)
    private readonly weekendRepo: Repository<WeekendSetting>, private readonly tenantQueryService: TenantQueryService
  ) {}

  async create(dto: CreateWeekendDto[]) {
    for (const item of dto) {
      const existing = await this.weekendRepo.findOne({
        where: {
          day: item.day,

          weekNumber: item.weekNumber,
            tenantId: this.tenantQueryService.getTenantWhereClause().tenantId
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
        where: { tenantId: this.tenantQueryService.getTenantWhereClause().tenantId }
    });
  }

  async remove(id: string) {
    const weekend = await this.weekendRepo.findOne({
      where: {
        id,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId
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
