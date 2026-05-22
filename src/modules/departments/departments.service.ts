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

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const exists = await this.departmentRepository.findOne({
      where: [
        {
          name: dto.name,
        },
        {
          code: dto.code,
        },
      ],
    });

    if (exists) {
      throw new ConflictException('Department already exists');
    }

    const department = this.departmentRepository.create(dto);

    return this.departmentRepository.save(department);
  }

  async findAll(page = 1, limit = 10, search?: string) {
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

  async findOne(id: string) {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

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
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Department name already exists');
      }
    }

    if (dto.code) {
      const exists = await this.departmentRepository.findOne({
        where: {
          code: dto.code,
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Department code already exists');
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
