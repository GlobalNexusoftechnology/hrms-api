import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { TenantFilterDto } from './dto/tenant-filter.dto';
import { TenantStatus } from '../../common/enums/tenant-status.enum';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(filterDto: TenantFilterDto) {
    const { search, status, page = 1, limit = 10 } = filterDto;

    const qb = this.tenantRepository.createQueryBuilder('tenant');

    if (search) {
      qb.andWhere(
        '(tenant.name ILIKE :search OR tenant.code ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (status) {
      qb.andWhere('tenant.status = :status', { status });
    }

    qb.orderBy('tenant.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
    return tenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (dto.code && dto.code !== tenant.code) {
      const existingCode = await this.tenantRepository.findOne({
        where: { code: dto.code.trim().toUpperCase() },
      });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Tenant code '${dto.code}' is already taken`);
      }
      tenant.code = dto.code.trim().toUpperCase();
    }

    if (dto.name && dto.name !== tenant.name) {
      const existingName = await this.tenantRepository.findOne({
        where: { name: dto.name.trim() },
      });
      if (existingName && existingName.id !== id) {
        throw new ConflictException(`Tenant name '${dto.name}' is already taken`);
      }
      tenant.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      tenant.description = dto.description?.trim();
    }

    if (dto.status !== undefined) {
      tenant.status = dto.status;
    }

    return this.tenantRepository.save(tenant);
  }

  async updateStatus(id: string, dto: UpdateTenantStatusDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.status = dto.status;
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);

    // Set to INACTIVE status as safe soft delete / decommissioning
    tenant.status = TenantStatus.INACTIVE;
    await this.tenantRepository.save(tenant);

    return {
      message: `Tenant '${tenant.name}' status set to INACTIVE successfully`,
      tenantId: tenant.id,
      status: tenant.status,
    };
  }
}
