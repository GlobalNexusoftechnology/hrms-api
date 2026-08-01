import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeavePolicy } from './entities/leave-policy.entity';
import { Repository } from 'typeorm';
import { LeaveType } from '../leave-type/entities/leave-type.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";

@Injectable()
export class LeavePolicyService {
  constructor(
    @InjectRepository(LeavePolicy)
    private readonly leavePolicyRepo: Repository<LeavePolicy>,
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>, private readonly tenantQueryService: TenantQueryService
  ) {}

  async create(createLeavePolicyDto: CreateLeavePolicyDto) {
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id: createLeavePolicyDto.leaveTypeId,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId
    },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave Type not found');
    }

    const leavePolicy = this.leavePolicyRepo.create(createLeavePolicyDto);
    return this.leavePolicyRepo.save(leavePolicy);
  }

  findAll() {
    return this.leavePolicyRepo.find({
      relations: { leaveType: true },
        where: { tenantId: this.tenantQueryService.getTenantWhereClause().tenantId }
    });
  }

  async findOne(id: string) {
    const leavePolicy = await this.leavePolicyRepo.findOne({
      where: { id,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId
    },
      relations: { leaveType: true },
    });

    if (!leavePolicy) {
      throw new NotFoundException('Leave Policy not found');
    }

    return leavePolicy;
  }

  async update(id: string, updateLeavePolicyDto: UpdateLeavePolicyDto) {
    const leavePolicy = await this.findOne(id);

    if (updateLeavePolicyDto.leaveTypeId) {
      const leaveType = await this.leaveTypeRepo.findOne({
        where: { id: updateLeavePolicyDto.leaveTypeId,
            tenantId: this.tenantQueryService.getTenantWhereClause().tenantId
        },
      });
      if (!leaveType) {
        throw new NotFoundException('Leave Type not found');
      }
    }

    Object.assign(leavePolicy, updateLeavePolicyDto);
    return this.leavePolicyRepo.save(leavePolicy);
  }

  async remove(id: string) {
    const leavePolicy = await this.findOne(id);
    return this.leavePolicyRepo.remove(leavePolicy);
  }
}
