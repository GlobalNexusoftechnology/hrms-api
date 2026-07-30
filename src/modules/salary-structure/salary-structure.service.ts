import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, DataSource, In } from 'typeorm';

import { SalaryStructure } from './entities/salary-structure.entity';
import { SalaryStructureComponent } from './entities/salary-structure-component.entity';
import { SalaryComponent } from './entities/salary-component.entity';
import { Employee } from '../employees/entities/employee.entity';

import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';

import { DataScopeEnum } from '../../common/enums/data-scope.enum';
import { SalaryComponentTypeEnum } from '../../common/enums/salary-component-type.enum';
import { CalculationTypeEnum } from '../../common/enums/calculation-type.enum';

@Injectable()
export class SalaryStructureService {
  constructor(
    @InjectRepository(SalaryStructure)
    private readonly salaryRepo: Repository<SalaryStructure>,
    @InjectRepository(SalaryComponent)
    private readonly componentRepo: Repository<SalaryComponent>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
  ) {}

  private validateRoleAccess(currentUser: any, targetEmployee: Employee) {
    if (targetEmployee.id === currentUser.id) {
      throw new ForbiddenException(
        'You cannot manage your own salary structure',
      );
    }

    if (!currentUser.role || !targetEmployee.role) return;

    if (targetEmployee.role.authorityLevel >= currentUser.role.authorityLevel) {
      throw new ForbiddenException(
        'You cannot manage salary structures for peers or superiors',
      );
    }

    const scope = currentUser.role.dataScope;
    if (scope === DataScopeEnum.ORGANIZATION) return;

    if (scope === DataScopeEnum.BRANCH) {
      if (
        currentUser.branchId &&
        targetEmployee.branchId &&
        currentUser.branchId !== targetEmployee.branchId
      ) {
        throw new ForbiddenException(
          'You do not have permission to manage salary structures in this branch',
        );
      }
    }

    if (scope === DataScopeEnum.DEPARTMENT) {
      if (
        currentUser.departmentId &&
        targetEmployee.departmentId &&
        currentUser.departmentId !== targetEmployee.departmentId
      ) {
        throw new ForbiddenException(
          'You do not have permission to manage salary structures in this department',
        );
      }
    }

    if (scope === DataScopeEnum.TEAM || scope === DataScopeEnum.SELF) {
      throw new ForbiddenException(
        'You do not have sufficient data scope to manage salary structures',
      );
    }
  }

  // =====================
  // SALARY COMPONENTS
  // =====================

  async createComponent(dto: CreateSalaryComponentDto) {
    if (!dto.organizationId) {
      throw new BadRequestException('organizationId is required');
    }
    if (!dto.code) {
      throw new BadRequestException('code is required');
    }

    const existingCode = await this.componentRepo.findOne({
      where: { organizationId: dto.organizationId, code: dto.code },
    });
    if (existingCode) {
      throw new BadRequestException(
        `Component with code ${dto.code} already exists in this organization`,
      );
    }

    if (dto.displayOrder !== undefined && dto.displayOrder !== null) {
      const existingOrder = await this.componentRepo.findOne({
        where: {
          organizationId: dto.organizationId,
          displayOrder: dto.displayOrder,
        },
      });
      if (existingOrder) {
        throw new BadRequestException(
          `Component with display order ${dto.displayOrder} already exists in this organization`,
        );
      }
    }

    const comp = this.componentRepo.create(dto);
    return this.componentRepo.save(comp);
  }

  async updateComponent(id: string, dto: UpdateSalaryComponentDto) {
    const existing = await this.componentRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Salary component not found');

    if (dto.code && dto.code !== existing.code) {
      const existingCode = await this.componentRepo.findOne({
        where: { organizationId: existing.organizationId, code: dto.code },
      });
      if (existingCode) {
        throw new BadRequestException(
          `Component with code ${dto.code} already exists in this organization`,
        );
      }
    }

    if (
      dto.displayOrder !== undefined &&
      dto.displayOrder !== null &&
      dto.displayOrder !== existing.displayOrder
    ) {
      const existingOrder = await this.componentRepo.findOne({
        where: {
          organizationId: existing.organizationId,
          displayOrder: dto.displayOrder,
        },
      });
      if (existingOrder) {
        throw new BadRequestException(
          `Component with display order ${dto.displayOrder} already exists in this organization`,
        );
      }
    }

    await this.componentRepo.update(id, dto);
    return this.componentRepo.findOne({ where: { id } });
  }

  async getComponents(organizationId: string) {
    return this.componentRepo.find({
      where: { organizationId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // =====================
  // SALARY STRUCTURE
  // =====================

  private formatResponse(salary: SalaryStructure) {
    let totalEarnings = 0;
    let totalDeductions = 0;

    const formattedComponents = salary.components?.map((c) => {
      const amount = Number(c.calculatedAmount);
      if (c.salaryComponent?.type === SalaryComponentTypeEnum.EARNING) {
        totalEarnings += amount;
      } else if (
        c.salaryComponent?.type === SalaryComponentTypeEnum.DEDUCTION
      ) {
        totalDeductions += amount;
      }

      return {
        id: c.id,
        salaryComponentId: c.salaryComponentId,
        componentCode: c.salaryComponent?.code,
        componentName: c.componentName,
        type: c.salaryComponent?.type,
        calculationType: c.calculationType,
        percentageValue: c.percentageValue ? Number(c.percentageValue) : null,
        calculatedAmount: amount,
      };
    });

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
      totalEarnings,
      totalDeductions,
      grossSalary: Number(salary.grossSalary),
      effectiveFrom: salary.effectiveFrom,
      effectiveTo: (salary as any).effectiveTo || null,
      isActive: salary.isActive,
      components: formattedComponents,
    };
  }

  async create(dto: CreateSalaryStructureDto, currentUser: any) {
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employeeId, deletedAt: IsNull() },
      relations: { role: true, branch: true },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    this.validateRoleAccess(currentUser, employee);

    const existing = await this.salaryRepo.findOne({
      where: { employeeId: dto.employeeId, isActive: true },
    });

    if (existing)
      throw new BadRequestException('Salary structure already exists');

    return this.dataSource.transaction(async (manager) => {
      let grossSalary = Number(dto.basicSalary);
      const structureComponents: SalaryStructureComponent[] = [];
      const componentIds = dto.components.map((c) => c.componentId);

      const uniqueIds = new Set(componentIds);
      if (uniqueIds.size !== componentIds.length) {
        throw new BadRequestException(
          'Duplicate components are not allowed in the same salary structure',
        );
      }

      // Mandatory components check
      const orgId =
        employee.branch?.organizationId || currentUser?.branch?.organizationId;
      if (orgId) {
        const mandatoryComponents = await manager.find(SalaryComponent, {
          where: { organizationId: orgId, isMandatory: true, isActive: true },
        });
        for (const mandatory of mandatoryComponents) {
          if (!componentIds.includes(mandatory.id)) {
            throw new BadRequestException(
              `Mandatory component ${mandatory.name} must be included`,
            );
          }
        }
      }

      let masterComponents: SalaryComponent[] = [];
      if (componentIds.length > 0) {
        masterComponents = await manager.find(SalaryComponent, {
          where: { id: In(componentIds) },
        });
      }

      for (const compDto of dto.components) {
        const masterComp = masterComponents.find(
          (c) => c.id === compDto.componentId,
        );
        if (!masterComp)
          throw new NotFoundException(
            `Component ${compDto.componentId} not found`,
          );
        if (!masterComp.isActive)
          throw new BadRequestException(
            `Component ${masterComp.name} is not active`,
          );

        let calculatedAmount = 0;

        if (
          compDto.overrideAmount !== undefined &&
          compDto.overrideAmount !== null
        ) {
          if (!masterComp.allowOverride) {
            throw new BadRequestException(
              `Component ${masterComp.name} does not allow overrides`,
            );
          }
          calculatedAmount = Number(compDto.overrideAmount);
        } else {
          if (
            masterComp.calculationType === CalculationTypeEnum.PERCENTAGE &&
            masterComp.percentageValue
          ) {
            calculatedAmount =
              Number(dto.basicSalary) *
              (Number(masterComp.percentageValue) / 100);
          } else {
            calculatedAmount = Number(masterComp.defaultAmount);
          }
        }

        if (masterComp.type === SalaryComponentTypeEnum.EARNING) {
          grossSalary += calculatedAmount;
        }

        const structureComp = manager.create(SalaryStructureComponent, {
          salaryComponentId: masterComp.id,
          componentName: masterComp.name,
          calculationType: masterComp.calculationType,
          percentageValue: masterComp.percentageValue,
          calculatedAmount: calculatedAmount,
        });

        structureComponents.push(structureComp);
      }

      const newStructure = manager.create(SalaryStructure, {
        employeeId: dto.employeeId,
        basicSalary: dto.basicSalary,
        grossSalary: grossSalary,
        effectiveFrom: dto.effectiveFrom,
        isActive: true,
        components: structureComponents,
      });

      const savedStructure = await manager.save(newStructure);
      return this.findOne(savedStructure.id, manager);
    });
  }

  async getMySalaryStructure(employeeId: string) {
    const salary = await this.salaryRepo.findOne({
      where: { employeeId, isActive: true },
      relations: { employee: true, components: { salaryComponent: true } },
    });

    if (!salary) throw new NotFoundException('Salary structure not found');
    return this.formatResponse(salary);
  }

  async findOne(id: string, manager = this.salaryRepo.manager) {
    const salary = await manager.findOne(SalaryStructure, {
      where: { id },
      relations: { employee: true, components: { salaryComponent: true } },
    });

    if (!salary) throw new NotFoundException('Salary structure not found');
    return this.formatResponse(salary);
  }

  async findAll(query: any) {
    const { employeeId, page = 1, limit = 10 } = query;
    const parsedPage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const parsedLimit = Math.max(1, isNaN(Number(limit)) ? 10 : Number(limit));

    const qb = this.salaryRepo.createQueryBuilder('salary');
    qb.leftJoinAndSelect('salary.employee', 'employee');
    qb.leftJoinAndSelect('salary.components', 'components');
    qb.leftJoinAndSelect('components.salaryComponent', 'salaryComponent');
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

  async update(id: string, dto: UpdateSalaryStructureDto, currentUser: any) {
    const salary = await this.salaryRepo.findOne({
      where: { id },
      relations: { employee: { role: true, branch: true } },
    });

    if (!salary) throw new NotFoundException('Salary structure not found');
    this.validateRoleAccess(currentUser, salary.employee);

    return this.dataSource.transaction(async (manager) => {
      salary.isActive = false;
      await manager.save(salary);

      const createDto = new CreateSalaryStructureDto();
      createDto.employeeId = salary.employeeId;
      createDto.basicSalary = dto.basicSalary ?? salary.basicSalary;
      createDto.effectiveFrom =
        dto.effectiveFrom ?? new Date().toISOString().split('T')[0];

      // Inherit previous components if not provided in update
      if (!dto.components || dto.components.length === 0) {
        createDto.components =
          salary.components?.map((c) => ({
            componentId: c.salaryComponentId,
            overrideAmount:
              c.calculationType === CalculationTypeEnum.FIXED_AMOUNT
                ? c.calculatedAmount
                : undefined,
          })) || [];
      } else {
        createDto.components = dto.components;
      }

      let grossSalary = Number(createDto.basicSalary);
      const structureComponents: SalaryStructureComponent[] = [];
      const componentIds = createDto.components.map((c) => c.componentId);

      const uniqueIds = new Set(componentIds);
      if (uniqueIds.size !== componentIds.length) {
        throw new BadRequestException(
          'Duplicate components are not allowed in the same salary structure',
        );
      }

      // Mandatory components check
      const orgId =
        salary.employee.branch?.organizationId ||
        currentUser?.branch?.organizationId;
      if (orgId) {
        const mandatoryComponents = await manager.find(SalaryComponent, {
          where: { organizationId: orgId, isMandatory: true, isActive: true },
        });
        for (const mandatory of mandatoryComponents) {
          if (!componentIds.includes(mandatory.id)) {
            throw new BadRequestException(
              `Mandatory component ${mandatory.name} must be included`,
            );
          }
        }
      }

      let masterComponents: SalaryComponent[] = [];
      if (componentIds.length > 0) {
        masterComponents = await manager.find(SalaryComponent, {
          where: { id: In(componentIds) },
        });
      }

      for (const compDto of createDto.components) {
        const masterComp = masterComponents.find(
          (c) => c.id === compDto.componentId,
        );
        if (!masterComp)
          throw new NotFoundException(
            `Component ${compDto.componentId} not found`,
          );
        if (!masterComp.isActive)
          throw new BadRequestException(
            `Component ${masterComp.name} is not active`,
          );

        let calculatedAmount = 0;

        if (
          compDto.overrideAmount !== undefined &&
          compDto.overrideAmount !== null
        ) {
          if (!masterComp.allowOverride) {
            throw new BadRequestException(
              `Component ${masterComp.name} does not allow overrides`,
            );
          }
          calculatedAmount = Number(compDto.overrideAmount);
        } else {
          if (
            masterComp.calculationType === CalculationTypeEnum.PERCENTAGE &&
            masterComp.percentageValue
          ) {
            calculatedAmount =
              Number(createDto.basicSalary) *
              (Number(masterComp.percentageValue) / 100);
          } else {
            calculatedAmount = Number(masterComp.defaultAmount);
          }
        }

        if (masterComp.type === SalaryComponentTypeEnum.EARNING) {
          grossSalary += calculatedAmount;
        }

        const structureComp = manager.create(SalaryStructureComponent, {
          salaryComponentId: masterComp.id,
          componentName: masterComp.name,
          calculationType: masterComp.calculationType,
          percentageValue: masterComp.percentageValue,
          calculatedAmount: calculatedAmount,
        });

        structureComponents.push(structureComp);
      }

      const newStructure = manager.create(SalaryStructure, {
        employeeId: createDto.employeeId,
        basicSalary: createDto.basicSalary,
        grossSalary: grossSalary,
        effectiveFrom: createDto.effectiveFrom,
        isActive: true,
        components: structureComponents,
      });

      const savedStructure = await manager.save(newStructure);
      return this.findOne(savedStructure.id, manager);
    });
  }
}
