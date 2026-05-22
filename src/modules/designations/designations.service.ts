import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { Designation } from './entities/designation.entity';

import { Department } from '../departments/entities/department.entity';

import { CreateDesignationDto } from './dto/create-designation.dto';

import { UpdateDesignationDto } from './dto/update-designation.dto';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDesignationDto) {
    const department = await this.departmentRepository.findOne({
      where: {
        id: dto.departmentId,
        deletedAt: IsNull(),
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const exists = await this.designationRepository.findOne({
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
      throw new ConflictException('Designation already exists');
    }

    const designation = this.designationRepository.create(dto);

    return this.designationRepository.save(designation);
  }

  async findAll(page = 1, limit = 10, search?: string, departmentId?: string) {
    const queryBuilder = this.designationRepository
      .createQueryBuilder('designation')
      .leftJoinAndSelect('designation.department', 'department');

    queryBuilder.andWhere('designation.deleted_at IS NULL');

    if (search) {
      queryBuilder.andWhere(
        `
        (
          designation.name
            ILIKE :search

          OR

          designation.code
            ILIKE :search
        )
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (departmentId) {
      queryBuilder.andWhere(
        `
        designation.department_id =
        :departmentId
        `,
        {
          departmentId,
        },
      );
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
    const designation = await this.designationRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },

      relations: {
        department: true,
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async update(id: string, dto: UpdateDesignationDto) {
    const designation = await this.findOne(id);

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    if (dto.name) {
      const exists = await this.designationRepository.findOne({
        where: {
          name: dto.name,
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Designation name already exists');
      }
    }

    if (dto.code) {
      const exists = await this.designationRepository.findOne({
        where: {
          code: dto.code,
        },
      });

      if (exists && exists.id !== id) {
        throw new ConflictException('Designation code already exists');
      }
    }

    Object.assign(designation, dto);

    return this.designationRepository.save(designation);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.designationRepository.softDelete(id);

    return {
      message: 'Designation deleted successfully',
    };
  }

  async restore(id: string) {
    const designation = await this.designationRepository.findOne({
      where: {
        id,
      },

      withDeleted: true,
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    await this.designationRepository.restore(id);

    return {
      message: 'Designation restored successfully',
    };
  }
}
