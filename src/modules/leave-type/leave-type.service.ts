import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,
  ) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto) {
    const existing = await this.leaveTypeRepo.findOne({
      where: [{ name: createLeaveTypeDto.name }, { code: createLeaveTypeDto.code }],
    });

    if (existing) {
      throw new BadRequestException('Leave Type with this name or code already exists');
    }

    const leaveType = this.leaveTypeRepo.create(createLeaveTypeDto);
    return this.leaveTypeRepo.save(leaveType);
  }

  findAll() {
    return this.leaveTypeRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const leaveType = await this.leaveTypeRepo.findOne({ where: { id } });
    if (!leaveType) {
      throw new NotFoundException('Leave Type not found');
    }
    return leaveType;
  }

  async update(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto) {
    const leaveType = await this.findOne(id);
    
    if (updateLeaveTypeDto.name || updateLeaveTypeDto.code) {
      const existing = await this.leaveTypeRepo.findOne({
        where: [
          { name: updateLeaveTypeDto.name ?? leaveType.name },
          { code: updateLeaveTypeDto.code ?? leaveType.code },
        ],
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Leave Type with this name or code already exists');
      }
    }

    Object.assign(leaveType, updateLeaveTypeDto);
    return this.leaveTypeRepo.save(leaveType);
  }

  async remove(id: string) {
    const leaveType = await this.findOne(id);
    return this.leaveTypeRepo.remove(leaveType);
  }
}
