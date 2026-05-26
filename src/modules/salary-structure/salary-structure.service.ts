import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { SalaryStructure } from './entities/salary-structure.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

@Injectable()
export class SalaryStructureService {
  constructor(
    @InjectRepository(SalaryStructure)
    private readonly salaryRepo: Repository<SalaryStructure>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  private formatResponse(salary: SalaryStructure) {
    return {
      id: salary.id,

      employee: salary.employee
        ? {
            id: salary.employee.id,

            employeeCode: salary.employee.employeeCode,

            name: `${salary.employee.firstName} ${salary.employee.lastName}`,

            email: salary.employee.email,
          }
        : null,

      basicSalary: Number(salary.basicSalary),

      hra: Number(salary.hra),

      allowance: Number(salary.allowance),

      bonus: Number(salary.bonus),

      pf: Number(salary.pf),

      esic: Number(salary.esic),

      professionalTax: Number(salary.professionalTax),

      grossSalary: Number(salary.grossSalary),

      netSalary: Number(salary.netSalary),

      effectiveFrom: salary.effectiveFrom,

      isActive: salary.isActive,
    };
  }

  async create(dto: CreateSalaryStructureDto) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: dto.employeeId,

        deletedAt: IsNull(),
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existing = await this.salaryRepo.findOne({
      where: {
        employeeId: dto.employeeId,

        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException('Salary structure already exists');
    }

    const grossSalary =
      Number(dto.basicSalary) +
      Number(dto.hra ?? 0) +
      Number(dto.allowance ?? 0) +
      Number(dto.bonus ?? 0);

    const totalDeduction =
      Number(dto.pf ?? 0) +
      Number(dto.esic ?? 0) +
      Number(dto.professionalTax ?? 0);

    const netSalary = grossSalary - totalDeduction;

    const created = await this.salaryRepo.save({
      ...dto,

      grossSalary,

      netSalary,

      hra: dto.hra ?? 0,

      allowance: dto.allowance ?? 0,

      bonus: dto.bonus ?? 0,

      pf: dto.pf ?? 0,

      esic: dto.esic ?? 0,

      professionalTax: dto.professionalTax ?? 0,
    });

    const salary = await this.salaryRepo.findOneOrFail({
      where: {
        id: created.id,
      },

      relations: {
        employee: true,
      },
    });

    return this.formatResponse(salary);
  }

  async getMySalaryStructure(employeeId: string) {
    const salary = await this.salaryRepo.findOne({
      where: {
        employeeId,

        isActive: true,
      },

      relations: {
        employee: true,
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    return this.formatResponse(salary);
  }

  async findOne(id: string) {
    const salary = await this.salaryRepo.findOne({
      where: {
        id,
      },

      relations: {
        employee: true,
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    return this.formatResponse(salary);
  }

  async findAll(query: any) {
    const {
      employeeId,

      page = 1,

      limit = 10,
    } = query;

    const qb = this.salaryRepo.createQueryBuilder('salary');

    qb.leftJoinAndSelect('salary.employee', 'employee');

    qb.where('salary.is_active = true');

    if (employeeId) {
      qb.andWhere(
        `
      salary.employee_id = :employeeId
      `,
        {
          employeeId,
        },
      );
    }

    qb.orderBy('salary.created_at', 'DESC');

    qb.skip((Number(page) - 1) * Number(limit));

    qb.take(Number(limit));

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => this.formatResponse(item)),

      meta: {
        total,

        page: Number(page),

        limit: Number(limit),

        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async update(
    id: string,

    dto: UpdateSalaryStructureDto,
  ) {
    const salary = await this.salaryRepo.findOne({
      where: {
        id,
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    Object.assign(salary, dto);

    const grossSalary =
      Number(salary.basicSalary) +
      Number(salary.hra) +
      Number(salary.allowance) +
      Number(salary.bonus);

    const totalDeduction =
      Number(salary.pf) + Number(salary.esic) + Number(salary.professionalTax);

    salary.grossSalary = grossSalary;

    salary.netSalary = grossSalary - totalDeduction;

    await this.salaryRepo.save(salary);

    return this.findOne(salary.id);
  }
}
