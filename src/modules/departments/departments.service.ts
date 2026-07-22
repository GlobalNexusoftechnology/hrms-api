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

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly dataScopeService: DataScopeService,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const existingName = await this.departmentRepository.findOne({
      where: {
        name: dto.name,
        deletedAt: IsNull(),
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Department name '${dto.name}' already exists`,
      );
    }

    const existingCode = await this.departmentRepository.findOne({
      where: {
        code: dto.code,
        deletedAt: IsNull(),
      },
    });

    if (existingCode) {
      throw new ConflictException(
        `Department code '${dto.code}' already exists`,
      );
    }

    const department = this.departmentRepository.create(dto);

    return await this.departmentRepository.save(department);
  }

  async findAll(page = 1, limit = 10, search?: string, currentUser?: Employee) {
    const queryBuilder =
      this.departmentRepository.createQueryBuilder('department');

    queryBuilder.andWhere('department.deleted_at IS NULL');

    if (search) {
      queryBuilder.andWhere(
        `
        (
          department.name
            ILIKE :search

          OR

          department.code
            ILIKE :search
        )
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'department.branchId',
        department: 'department.id'
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
    const queryBuilder = this.departmentRepository.createQueryBuilder('department');

    queryBuilder
      .where('department.id = :id', { id })
      .andWhere('department.deleted_at IS NULL');

    if (currentUser) {
      this.dataScopeService.applyScope(queryBuilder, currentUser, {
        branch: 'department.branchId',
        department: 'department.id'
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

    if (dto.name) {
      const exists = await this.departmentRepository.findOne({
        where: {
          name: dto.name,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Department name '${dto.name}' already exists`,
        );
      }
    }

    if (dto.code) {
      const exists = await this.departmentRepository.findOne({
        where: {
          code: dto.code,
          deletedAt: IsNull(),
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException(
          `Department code '${dto.code}' already exists`,
        );
      }
    }

    Object.assign(department, dto);

    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.departmentRepository.softDelete(id);

    return {
      message: 'Department deleted successfully',
    };
  }

  async restore(id: string) {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
      },

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
