import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OrganizationContact } from '../entities/organization-contact.entity';
import { CreateOrganizationContactDto } from '../dto/create-organization-contact.dto';
import { UpdateOrganizationContactDto } from '../dto/update-organization-contact.dto';
import { OrganizationService } from './organization.service';
import { DataScopeService } from '../../../common/services/data-scope.service';

@Injectable()
export class OrganizationContactService {
  constructor(
    @InjectRepository(OrganizationContact)
    private readonly contactRepo: Repository<OrganizationContact>,
    private readonly organizationService: OrganizationService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async create(createDto: CreateOrganizationContactDto, userId?: string) {
    const org = await this.organizationService.get();
    const contact = this.contactRepo.create({
      ...createDto,
      organizationId: org.id,
      createdByUserId: userId,
    });
    return this.contactRepo.save(contact);
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationContactDto,
    userId?: string,
  ) {
    const org = await this.organizationService.get();
    const contact = await this.contactRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!contact) throw new NotFoundException('Contact not found');

    Object.assign(contact, updateDto, { updatedByUserId: userId });
    return this.contactRepo.save(contact);
  }

  async findOrgLevel(currentUser?: any) {
    const org = await this.organizationService.get();
    const qb = this.contactRepo.createQueryBuilder('contact')
      .where('contact.organizationId = :orgId', { orgId: org.id })
      .andWhere('contact.branchId IS NULL');

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'contact.branchId',
      });
    }

    return qb.getMany();
  }

  async findByBranch(branchId: string, currentUser?: any) {
    const org = await this.organizationService.get();
    const qb = this.contactRepo.createQueryBuilder('contact')
      .where('contact.organizationId = :orgId', { orgId: org.id })
      .andWhere('contact.branchId = :branchId', { branchId });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'contact.branchId',
      });
    }

    return qb.getMany();
  }

  async remove(id: string, userId?: string) {
    const org = await this.organizationService.get();
    const contact = await this.contactRepo.findOne({
      where: { id, organizationId: org.id },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.contactRepo.softRemove(contact);
  }
}
