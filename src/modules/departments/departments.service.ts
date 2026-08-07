import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DataScopeService } from '../../common/services/data-scope.service';
import { Employee } from '../employees/entities/employee.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Branch } from '../organization/entities/branch.entity';
import { TenantQueryService } from '../../common/services/tenant-query.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataScopeService: DataScopeService,
    private readonly tenantQueryService: TenantQueryService,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    if (dto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: dto.branchId, tenantId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
      }
    }

    const existingName = await this.departmentRepository.findOne({
      where: {
        name: dto.name,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Department name '${dto.name}' already exists in this tenant`,
      );
    }

    const existingCode = await this.departmentRepository.findOne({
      where: {
        code: dto.code,
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (existingCode) {
      throw new ConflictException(
        `Department code '${dto.code}' already exists in this tenant`,
      );
    }

    const department = this.departmentRepository.create({
      ...dto,
      tenantId,
    });

    return await this.departmentRepository.save(department);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    branchId?: string,
    currentUser?: Employee,
  ) {
    const queryBuilder =
      this.departmentRepository.createQueryBuilder('department')
        .leftJoinAndSelect('department.branch', 'branch');

    this.tenantQueryService.applyTenantFilter(queryBuilder, 'department');

    queryBuilder.andWhere('department.deleted_at IS NULL');

    if (branchId) {
      queryBuilder.andWhere('(department.branch_id = :branchId OR department.branch_id IS NULL)', { branchId });
    }

    if (search) {
      queryBuilder.andWhere(
        `
        (
          department.name ILIKE :search
          OR
          department.code ILIKE :search
        )
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'department.branch_id',
        department: 'department.id',
      });
    }

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);
    queryBuilder.orderBy('department.created_at', 'DESC');

    const [departments, total] = await queryBuilder.getManyAndCount();

    return {
      data: departments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser?: Employee) {
    const queryBuilder =
      this.departmentRepository.createQueryBuilder('department')
        .leftJoinAndSelect('department.branch', 'branch');

    this.tenantQueryService.applyTenantFilter(queryBuilder, 'department');

    queryBuilder
      .andWhere('department.id = :id', { id })
      .andWhere('department.deleted_at IS NULL');

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'department.branch_id',
        department: 'department.id',
      });
    }

    const department = await queryBuilder.getOne();

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    if (dto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: dto.branchId, tenantId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID '${dto.branchId}' not found`);
      }
    }

    if (dto.name) {
      const exists = await this.departmentRepository.findOne({
        where: {
          name: dto.name,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Department name '${dto.name}' already exists in this tenant`,
        );
      }
    }

    if (dto.code) {
      const exists = await this.departmentRepository.findOne({
        where: {
          code: dto.code,
          tenantId,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Department code '${dto.code}' already exists in this tenant`,
        );
      }
    }

    Object.assign(department, dto);

    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    await this.findOne(id);
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const employeeCount = await this.employeeRepository.count({
      where: { departmentId: id, tenantId, deletedAt: IsNull() },
    });
    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete department as it currently has ${employeeCount} active employee(s) assigned.`,
      );
    }

    const designationCount = await this.designationRepository.count({
      where: { departmentId: id, tenantId, deletedAt: IsNull() },
    });
    if (designationCount > 0) {
      throw new ConflictException(
        `Cannot delete department as it has ${designationCount} designation(s) associated with it.`,
      );
    }

    await this.departmentRepository.softDelete(id);

    return {
      message: 'Department deleted successfully',
    };
  }

  async restore(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const department = await this.departmentRepository.findOne({
      where: { id, tenantId },
      withDeleted: true,
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    await this.departmentRepository.restore(id);

    return {
      message: 'Department restored successfully',
    };
  }
}
