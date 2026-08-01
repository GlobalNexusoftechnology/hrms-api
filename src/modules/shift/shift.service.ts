import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { TenantQueryService } from '../../common/services/tenant-query.service';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
    private readonly tenantQueryService: TenantQueryService,
  ) {}

  private calculateBreakMinutes(
    start?: string | null,
    end?: string | null,
  ): number | undefined {
    if (start && end) {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      const startDate = dayjs().hour(startHour).minute(startMin).second(0);
      let endDate = dayjs().hour(endHour).minute(endMin).second(0);
      if (endDate.isBefore(startDate)) {
        endDate = endDate.add(1, 'day');
      }
      return endDate.diff(startDate, 'minute');
    }
    return undefined;
  }

  async create(createShiftDto: CreateShiftDto, userId?: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    // Check duplicate name OR code within this tenant
    const existing = await this.shiftRepo.findOne({
      where: [
        { name: createShiftDto.name, tenantId },
        { code: createShiftDto.code, tenantId },
      ],
    });
    if (existing) {
      throw new ConflictException(
        'A shift with this name or code already exists.',
      );
    }

    const calculatedBreak = this.calculateBreakMinutes(
      createShiftDto.breakStartTime,
      createShiftDto.breakEndTime,
    );
    if (calculatedBreak !== undefined) {
      createShiftDto.totalBreakMinutes = calculatedBreak;
    }

    const shift = this.shiftRepo.create({
      ...createShiftDto,
      tenantId,
      createdByUserId: userId,
    });
    return this.shiftRepo.save(shift);
  }

  findAll() {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    return this.shiftRepo.find({ where: { tenantId } });
  }

  async findOne(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const shift = await this.shiftRepo.findOne({ where: { id, tenantId } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto, userId?: string) {
    const shift = await this.findOne(id); // already tenant-scoped

    Object.assign(shift, updateShiftDto, { updatedByUserId: userId });

    const calculatedBreak = this.calculateBreakMinutes(
      shift.breakStartTime,
      shift.breakEndTime,
    );
    if (calculatedBreak !== undefined) {
      shift.totalBreakMinutes = calculatedBreak;
    }

    return this.shiftRepo.save(shift);
  }

  async remove(id: string) {
    const shift = await this.findOne(id); // already tenant-scoped
    return this.shiftRepo.remove(shift);
  }
}
