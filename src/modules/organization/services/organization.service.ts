import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  async create(createDto: CreateOrganizationDto, userId?: string): Promise<Organization> {
    const count = await this.organizationRepo.count();
    if (count > 0) {
      throw new BadRequestException('Organization already exists. Only one organization is allowed.');
    }
    const org = this.organizationRepo.create({ ...createDto, createdByUserId: userId });
    return this.organizationRepo.save(org);
  }

  async get(): Promise<Organization> {
    const org = await this.organizationRepo.findOne({
      where: {}, 
      relations: { addresses: true, tax: true, settings: true },
    });
    if (!org) {
      throw new NotFoundException('Organization not initialized');
    }
    return org;
  }

  async update(updateDto: UpdateOrganizationDto, userId?: string): Promise<Organization> {
    const org = await this.get();
    Object.assign(org, updateDto, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId });
    return this.organizationRepo.save(org);
  }

  async uploadLogo(file: Express.Multer.File, userId?: string): Promise<Organization> {
    const org = await this.get();
    org.logoUrl = `/uploads/organization/${file.filename}`;
    return this.organizationRepo.save(org);
  }
}
