import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationTax } from '../entities/organization-tax.entity';
import { CreateOrganizationTaxDto } from '../dto/create-organization-tax.dto';
import { UpdateOrganizationTaxDto } from '../dto/update-organization-tax.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationTaxService {
  constructor(
    @InjectRepository(OrganizationTax)
    private readonly taxRepo: Repository<OrganizationTax>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationTaxDto, userId?: string) {
    const org = await this.organizationService.get();
    
    const count = await this.taxRepo.count({ where: { organizationId: org.id } });
    if (count > 0) {
      throw new BadRequestException('Organization tax profile already exists.');
    }

    const tax = this.taxRepo.create({
      ...createDto,
      organizationId: org.id,
        createdByUserId: userId
    });
    return this.taxRepo.save(tax);
  }

  async update(updateDto: UpdateOrganizationTaxDto, userId?: string) {
    const org = await this.organizationService.get();
    const tax = await this.taxRepo.findOne({ where: { organizationId: org.id } });
    
    if (!tax) throw new NotFoundException('Tax profile not found');

    Object.assign(tax, updateDto, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId });
    return this.taxRepo.save(tax);
  }
  
  async get() {
    const org = await this.organizationService.get();
    return this.taxRepo.findOne({ where: { organizationId: org.id } });
  }
}
