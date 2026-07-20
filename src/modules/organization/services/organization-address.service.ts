import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationAddress } from '../entities/organization-address.entity';
import { CreateOrganizationAddressDto } from '../dto/create-organization-address.dto';
import { UpdateOrganizationAddressDto } from '../dto/update-organization-address.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationAddressService {
  constructor(
    @InjectRepository(OrganizationAddress)
    private readonly addressRepo: Repository<OrganizationAddress>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationAddressDto, userId?: string) {
    const org = await this.organizationService.get();
    
    const existing = await this.addressRepo.findOne({
      where: { organizationId: org.id, addressType: createDto.addressType },
    });
    if (existing) {
      throw new BadRequestException(`Address type ${createDto.addressType} already exists.`);
    }

    const address = this.addressRepo.create({
      ...createDto,
      organizationId: org.id,
        createdByUserId: userId
    });
    return this.addressRepo.save(address);
  }

  async update(id: string, updateDto: UpdateOrganizationAddressDto, userId?: string) {
    const address = await this.addressRepo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');

    Object.assign(address, updateDto, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId });
    return this.addressRepo.save(address);
  }
  
  async findAll() {
    const org = await this.organizationService.get();
    return this.addressRepo.find({ where: { organizationId: org.id } });
  }
}
