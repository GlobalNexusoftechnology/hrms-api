import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository } from 'typeorm';

import { Holiday } from './entities/holiday.entity';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
  ) {}

  async create(dto: CreateHolidayDto) {
    const existing = await this.holidayRepo.findOne({
      where: {
        date: dto.date,
      },
    });

    if (existing) {
      throw new BadRequestException('Holiday already exists on this date');
    }

    return this.holidayRepo.save({
      name: dto.name.trim(),

      date: dto.date,

      type: dto.type,

      isPaid: dto.isPaid,

      description: dto.description?.trim() || null,
    });
  }

  async findAll(query: any) {
    const { month, year, type } = query;

    const qb = this.holidayRepo.createQueryBuilder('holiday');

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      qb.andWhere('holiday.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (type) {
      qb.andWhere('holiday.type = :type', {
        type,
      });
    }

    qb.orderBy('holiday.date', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const holiday = await this.holidayRepo.findOne({
      where: {
        id,
      },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const holiday = await this.findOne(id);

    if (dto.date && dto.date !== holiday.date) {
      const existing = await this.holidayRepo.findOne({
        where: {
          date: dto.date,
        },
      });

      if (existing) {
        throw new BadRequestException('Holiday already exists on this date');
      }
    }

    Object.assign(holiday, {
      ...dto,

      name: dto.name?.trim() ?? holiday.name,

      description: dto.description?.trim() ?? holiday.description,
    });

    return this.holidayRepo.save(holiday);
  }

  async remove(id: string) {
    const holiday = await this.findOne(id);

    await this.holidayRepo.remove(holiday);

    return {
      message: 'Holiday deleted successfully',
    };
  }
}
