import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private readonly cls: ClsService,
  ) {}

  private getTenantId(): string {
    const ctx = this.cls.get<TenantContext>('tenantContext');
    if (!ctx?.tenantId) {
      throw new BadRequestException('Tenant context not found. Are you authenticated?');
    }
    return ctx.tenantId;
  }

  async create(
    createDto: CreateOrganizationDto,
    userId?: string,
  ): Promise<Organization> {
    const tenantId = this.getTenantId();

    const count = await this.organizationRepo.count({
      where: { tenantId },
    });

    if (count > 0) {
      throw new BadRequestException(
        'Organization already exists for this tenant. Only one organization is allowed.',
      );
    }

    const org = this.organizationRepo.create({
      ...createDto,
      tenantId,
      createdByUserId: userId,
    });
    return this.organizationRepo.save(org);
  }

  async get(): Promise<Organization> {
    const tenantId = this.getTenantId();

    const org = await this.organizationRepo.findOne({
      where: { tenantId },
      relations: { addresses: true, tax: true, settings: true },
    });
    if (!org) {
      throw new NotFoundException(
        'Organization not found. Please create your organization first.',
      );
    }
    return org;
  }

  async update(
    updateDto: UpdateOrganizationDto,
    userId?: string,
  ): Promise<Organization> {
    const org = await this.get();
    Object.assign(org, updateDto, { updatedByUserId: userId });
    return this.organizationRepo.save(org);
  }

  async uploadLogo(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<Organization> {
    const org = await this.get();
    org.logoUrl = `/uploads/organization/${file.filename}`;
    org.updatedByUserId = userId;
    return this.organizationRepo.save(org);
  }
}
