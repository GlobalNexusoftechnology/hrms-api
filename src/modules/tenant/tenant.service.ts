import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>, private readonly tenantQueryService: TenantQueryService
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id,
        
    } });
  }
}
