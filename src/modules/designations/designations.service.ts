import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Designation } from './entities/designation.entity';
import { Department } from '../departments/entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { TenantQueryService } from '../../common/services/tenant-query.service';
import { DataScopeService } from '../../common/services/data-scope.service';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async create(dto: CreateDesignationDto) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const department = await this.departmentRepository.findOne({
      where: {
        id: dto.departmentId,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found in this tenant');
    }

    const existingName = await this.designationRepository.findOne({
      where: {
        name: dto.name,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Designation name '${dto.name}' already exists in this tenant`,
      );
    }

    const existingCode = await this.designationRepository.findOne({
      where: {
        code: dto.code,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingCode) {
      throw new ConflictException(
        `Designation code '${dto.code}' already exists in this tenant`,
      );
    }

    const designation = this.designationRepository.create({
      ...dto,
      tenantId, // Fixed: tenantId was missing, causing null constraint error on insert
    });

    return this.designationRepository.save(designation);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    departmentId?: string,
    branchId?: string,
    currentUser?: Employee,
  ) {
    const queryBuilder = this.designationRepository
      .createQueryBuilder('designation')
      .leftJoinAndSelect('designation.department', 'department')
      .leftJoinAndSelect('department.branch', 'branch');

    this.tenantQueryService.applyTenantFilter(queryBuilder, 'designation');

    queryBuilder.andWhere('designation.deleted_at IS NULL');

    if (search) {
      queryBuilder.andWhere(
        `
        (
          designation.name ILIKE :search
          OR
          designation.code ILIKE :search
        )
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (departmentId) {
      queryBuilder.andWhere('designation.department_id = :departmentId', {
        departmentId,
      });
    }

    if (branchId) {
      queryBuilder.andWhere('department.branch_id = :branchId', {
        branchId,
      });
    }

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'department.branchId',
        department: 'designation.departmentId',
      });
    }

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);
    queryBuilder.orderBy('designation.created_at', 'DESC');

    const [designations, total] = await queryBuilder.getManyAndCount();

    return {
      data: designations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const designation = await this.designationRepository.findOne({
      where: {
        id,
        tenantId,
        deletedAt: IsNull(),
      },
      relations: {
        department: {
          branch: true,
        },
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async update(id: string, dto: UpdateDesignationDto) {
    const designation = await this.findOne(id);
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found in this tenant');
      }
    }

    if (dto.name) {
      const exists = await this.designationRepository.findOne({
        where: {
          name: dto.name,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Designation name '${dto.name}' already exists in this tenant`,
        );
      }
    }

    if (dto.code) {
      const exists = await this.designationRepository.findOne({
        where: {
          code: dto.code,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Designation code '${dto.code}' already exists in this tenant`,
        );
      }
    }

    Object.assign(designation, dto);

    return this.designationRepository.save(designation);
  }

  async remove(id: string) {
    await this.findOne(id);
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const employeeCount = await this.employeeRepository.count({
      where: { designationId: id, tenantId, deletedAt: IsNull() },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete designation as it currently has ${employeeCount} active employee(s) assigned.`,
      );
    }

    await this.designationRepository.softDelete(id);

    return {
      message: 'Designation deleted successfully',
    };
  }

  async restore(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const designation = await this.designationRepository.findOne({
      where: { id, tenantId },
      withDeleted: true,
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    const existingName = await this.designationRepository.findOne({
      where: {
        name: designation.name,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Cannot restore. Designation name '${designation.name}' already exists in this tenant`,
      );
    }

    const existingCode = await this.designationRepository.findOne({
      where: {
        code: designation.code,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingCode) {
      throw new ConflictException(
        `Cannot restore. Designation code '${designation.code}' already exists in this tenant`,
      );
    }

    await this.designationRepository.restore(id);

    return {
      message: 'Designation restored successfully',
    };
  }
}
