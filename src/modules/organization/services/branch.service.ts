import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateBranchDto) {
    const org = await this.organizationService.get();
    
    // If this is set as head office, we might want to unset others. Keeping simple for now.
    const branch = this.branchRepo.create({
      ...createDto,
      organizationId: org.id,
    });
    return this.branchRepo.save(branch);
  }

  async update(id: string, updateDto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    Object.assign(branch, updateDto);
    return this.branchRepo.save(branch);
  }
  
  async findAll() {
    const org = await this.organizationService.get();
    return this.branchRepo.find({ where: { organizationId: org.id } });
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }
}
