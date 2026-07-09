import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { SalaryStructure } from './entities/salary-structure.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { RoleEnum } from '../../common/enums/role.enum';

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

  private validateRoleAccess(currentUser: any, targetEmployee: Employee) {
    if (currentUser.role.name === RoleEnum.HR) {
      if (
        targetEmployee.role.name === RoleEnum.SUPER_ADMIN ||
        targetEmployee.role.name === RoleEnum.HR
      ) {
        throw new ForbiddenException(
          'HR cannot manage salary structures for Admin or other HRs',
        );
      }
      if (targetEmployee.id === currentUser.id) {
        throw new ForbiddenException(
          'HR cannot manage their own salary structure',
        );
      }
    }
  }

  async create(dto: CreateSalaryStructureDto, currentUser: any) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: dto.employeeId,

        deletedAt: IsNull(),
      },
      relations: {
        role: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    this.validateRoleAccess(currentUser, employee);

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

    const parsedPage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const parsedLimit = Math.max(1, isNaN(Number(limit)) ? 10 : Number(limit));

    const qb = this.salaryRepo.createQueryBuilder('salary');

    qb.leftJoinAndSelect('salary.employee', 'employee');

    qb.where('salary.isActive = :isActive', { isActive: true });

    if (employeeId) {
      qb.andWhere('salary.employeeId = :employeeId', { employeeId });
    }

    qb.orderBy('salary.createdAt', 'DESC');

    qb.skip((parsedPage - 1) * parsedLimit);

    qb.take(parsedLimit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => this.formatResponse(item)),

      meta: {
        total,

        page: parsedPage,

        limit: parsedLimit,

        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async update(
    id: string,

    dto: UpdateSalaryStructureDto,

    currentUser: any,
  ) {
    const salary = await this.salaryRepo.findOne({
      where: {
        id,
      },
      relations: {
        employee: {
          role: true,
        },
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary structure not found');
    }

    this.validateRoleAccess(currentUser, salary.employee);

    const newSalaryId = await this.salaryRepo.manager.transaction(async (manager) => {
      salary.isActive = false;
      await manager.save(salary);

      const merged = { ...salary, ...dto };

      const grossSalary =
        Number(merged.basicSalary) +
        Number(merged.hra) +
        Number(merged.allowance) +
        Number(merged.bonus);

      const totalDeduction =
        Number(merged.pf) + Number(merged.esic) + Number(merged.professionalTax);

      const newSalary = manager.create(SalaryStructure, {
        employeeId: salary.employeeId,
        basicSalary: merged.basicSalary,
        hra: merged.hra,
        allowance: merged.allowance,
        bonus: merged.bonus,
        pf: merged.pf,
        esic: merged.esic,
        professionalTax: merged.professionalTax,
        grossSalary: grossSalary,
        netSalary: grossSalary - totalDeduction,
        effectiveFrom: dto.effectiveFrom || merged.effectiveFrom,
        isActive: true,
      });

      const created = await manager.save(newSalary);
      return created.id;
    });

    return this.findOne(newSalaryId);
  }
}
