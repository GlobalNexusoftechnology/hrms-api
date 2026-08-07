import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>, private readonly tenantQueryService: TenantQueryService
  ) {}

  async findAll() {
    return this.permissionRepository.find({
      order: { name: 'ASC' },
      where: { isActive: true },
    });
  }
}
