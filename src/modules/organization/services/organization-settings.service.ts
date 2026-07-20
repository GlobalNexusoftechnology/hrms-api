import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSettings } from '../entities/organization-settings.entity';
import { CreateOrganizationSettingsDto } from '../dto/create-organization-settings.dto';
import { UpdateOrganizationSettingsDto } from '../dto/update-organization-settings.dto';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepo: Repository<OrganizationSettings>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createDto: CreateOrganizationSettingsDto, userId?: string) {
    const org = await this.organizationService.get();
    
    const count = await this.settingsRepo.count({ where: { organizationId: org.id } });
    if (count > 0) {
      throw new BadRequestException('Organization settings already exist.');
    }

    const settings = this.settingsRepo.create({
      ...createDto,
      organizationId: org.id,
        createdByUserId: userId
    });
    return this.settingsRepo.save(settings);
  }

  async update(updateDto: UpdateOrganizationSettingsDto, userId?: string) {
    const org = await this.organizationService.get();
    const settings = await this.settingsRepo.findOne({ where: { organizationId: org.id } });
    
    if (!settings) throw new NotFoundException('Settings not found');

    Object.assign(settings, updateDto, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId }, { updatedByUserId: userId });
    return this.settingsRepo.save(settings);
  }
  
  async get() {
    const org = await this.organizationService.get();
    return this.settingsRepo.findOne({ where: { organizationId: org.id } });
  }
}
