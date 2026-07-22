import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
  ) {}

  async create(createShiftDto: CreateShiftDto) {
    const existing = await this.shiftRepo.findOne({
      where: [{ name: createShiftDto.name }, { code: createShiftDto.code }],
    });

    if (existing) {
      throw new ConflictException('Shift with this name or code already exists');
    }

    const shift = this.shiftRepo.create(createShiftDto);
    return this.shiftRepo.save(shift);
  }

  findAll() {
    return this.shiftRepo.find();
  }

  async findOne(id: string) {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.findOne(id);
    Object.assign(shift, updateShiftDto);
    return this.shiftRepo.save(shift);
  }

  async remove(id: string) {
    const shift = await this.findOne(id);
    return this.shiftRepo.remove(shift);
  }
}
