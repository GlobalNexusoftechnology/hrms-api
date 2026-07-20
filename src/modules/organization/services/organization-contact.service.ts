import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(createDto: CreateOrganizationContactDto) {
    const org = await this.organizationService.get();
    const contact = this.contactRepo.create({
      ...createDto,
      organizationId: org.id,
    });
    return this.contactRepo.save(contact);
  }

  async update(id: string, updateDto: UpdateOrganizationContactDto) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');

    Object.assign(contact, updateDto);
    return this.contactRepo.save(contact);
  }
  
  async findAll() {
    const org = await this.organizationService.get();
    return this.contactRepo.find({ where: { organizationId: org.id } });
  }

  async remove(id: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.contactRepo.softRemove(contact);
  }
}
