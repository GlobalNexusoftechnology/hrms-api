import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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

  async create(createDto: CreateBranchDto, userId?: string) {
    const org = await this.organizationService.get();
    
    // Validate single head office
    if (createDto.isHeadOffice) {
      const existingHeadOffice = await this.branchRepo.findOne({
        where: { organizationId: org.id, isHeadOffice: true },
      });
      if (existingHeadOffice) {
        throw new BadRequestException('A Head Office already exists for this organization. Only one Head Office is allowed.');
      }
    }

    // Auto-generate code if not provided
    if (!createDto.code) {
      const prefix = createDto.isHeadOffice ? 'HQ' : 'BR';
      const branchCount = await this.branchRepo.count();
      createDto.code = `${prefix}-${String(branchCount + 1).padStart(3, '0')}`;
    }

    const branch = this.branchRepo.create({
      ...createDto,
      organizationId: org.id,
      createdByUserId: userId
    });
    try {
      return await this.branchRepo.save(branch);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`A branch with this code or email already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateBranchDto, userId?: string) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    // Validate single head office
    if (updateDto.isHeadOffice) {
      const existingHeadOffice = await this.branchRepo.findOne({
        where: { organizationId: branch.organizationId, isHeadOffice: true },
      });
      if (existingHeadOffice && existingHeadOffice.id !== branch.id) {
        throw new BadRequestException('Another Head Office already exists for this organization. Only one Head Office is allowed.');
      }
    }

    Object.assign(branch, updateDto, { updatedByUserId: userId });
    try {
      return await this.branchRepo.save(branch);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`A branch with this code or email already exists.`);
      }
      throw error;
    }
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
