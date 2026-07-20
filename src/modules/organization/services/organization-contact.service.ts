import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OrganizationContact } from '../entities/organization-contact.entity';
import { CreateOrganizationContactDto } from '../dto/create-organization-contact.dto';
import { UpdateOrganizationContactDto } from '../dto/update-organization-contact.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationContactService {
  constructor(
    @InjectRepository(OrganizationContact)
    private readonly contactRepo: Repository<OrganizationContact>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationContactDto, userId?: string) {
    const org = await this.organizationService.get();
    const contact = this.contactRepo.create({
      ...createDto,
      organizationId: org.id,
        createdByUserId: userId
    });
    return this.contactRepo.save(contact);
  }

  async update(id: string, updateDto: UpdateOrganizationContactDto, userId?: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');

    Object.assign(contact, updateDto, { updatedByUserId: userId });
    return this.contactRepo.save(contact);
  }
  
  async findOrgLevel() {
    const org = await this.organizationService.get();
    return this.contactRepo.find({ where: { organizationId: org.id, branchId: IsNull() } });
  }

  async findByBranch(branchId: string) {
    return this.contactRepo.find({ where: { branchId } });
  }

  async remove(id: string, userId?: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.contactRepo.softRemove(contact);
  }
}
