import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeCareerMovement } from './entities/career-movement.entity';
import { CreateCareerMovementDto } from './dto/create-career-movement.dto';
import { Employee } from '../employees/entities/employee.entity';
import { CareerMovementStatusEnum } from '../../common/enums/career-movement-status.enum';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../activity-log/enums/activity-action.enum';

@Injectable()
export class CareerMovementsService {
  constructor(
    @InjectRepository(EmployeeCareerMovement)
    private readonly movementRepository: Repository<EmployeeCareerMovement>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(employeeId: string, dto: CreateCareerMovementDto, currentUserId?: string, correlationId?: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: { salaryStructures: true },
    });

    if (dto.impactPayroll && !dto.newSalaryStructureId) {
      throw new BadRequestException('If impactPayroll is true, newSalaryStructureId must be provided.');
    }
    if (dto.newSalaryStructureId && !dto.impactPayroll) {
      throw new BadRequestException('If newSalaryStructureId is provided, impactPayroll must be true.');
    }
    
    if (dto.impactPermissions && !dto.newRoleId) {
      throw new BadRequestException('If impactPermissions is true, newRoleId must be provided.');
    }
    if (dto.newRoleId && !dto.impactPermissions) {
      throw new BadRequestException('If newRoleId is provided, impactPermissions must be true.');
    }

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const activeSalary = employee.salaryStructures?.find(s => s.isActive);

    const movement = this.movementRepository.create({
      employeeId,
      movementType: dto.movementType,
      effectiveDate: new Date(dto.effectiveDate),
      reason: dto.reason,
      remarks: dto.remarks,
      referenceNumber: dto.referenceNumber,
      attachmentDocumentId: dto.attachmentDocumentId,
      impactPayroll: dto.impactPayroll ?? false,
      impactPermissions: dto.impactPermissions ?? false,
      status: CareerMovementStatusEnum.PENDING,
      
      // OLD VALUES
      oldBranchId: employee.branchId,
      oldDepartmentId: employee.departmentId,
      oldDesignationId: employee.designationId,
      oldRoleId: employee.roleId,
      oldShiftId: employee.shiftId,
      oldSalaryStructureId: activeSalary ? activeSalary.id : null,

      // NEW VALUES
      newBranchId: dto.newBranchId,
      newDepartmentId: dto.newDepartmentId,
      newDesignationId: dto.newDesignationId,
      newRoleId: dto.newRoleId,
      newShiftId: dto.newShiftId,
      newSalaryStructureId: dto.newSalaryStructureId,
      
      requestedBy: currentUserId,
      requestedAt: new Date(),
    });

    const savedMovement = await this.movementRepository.save(movement);

    if (currentUserId) {
      await this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Career Movements',
        action: ActivityAction.CREATE,
        description: `Requested ${dto.movementType} for Employee ID ${employeeId}`,
        entityType: 'EmployeeCareerMovement',
        entityId: savedMovement.id,
        newValue: savedMovement as unknown as Record<string, any>,
        correlationId,
      });
    }

    return savedMovement;
  }

  async findAll(employeeId: string) {
    return this.movementRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const movement = await this.movementRepository.findOne({ where: { id } });
    if (!movement) {
      throw new NotFoundException('Career movement not found');
    }
    return movement;
  }

  async approve(id: string, currentUserId?: string, correlationId?: string) {
    const movement = await this.findOne(id);

    if (movement.status !== CareerMovementStatusEnum.PENDING) {
      throw new BadRequestException('Can only approve PENDING movements');
    }

    movement.status = CareerMovementStatusEnum.APPROVED;
    movement.approvedBy = currentUserId || null;
    movement.approvedAt = new Date();

    const savedMovement = await this.movementRepository.save(movement);

    if (currentUserId) {
      await this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Career Movements',
        action: ActivityAction.UPDATE,
        description: `Approved ${movement.movementType} for Employee ID ${movement.employeeId}`,
        entityType: 'EmployeeCareerMovement',
        entityId: savedMovement.id,
        newValue: savedMovement as unknown as Record<string, any>,
      });
    }

    return savedMovement;
  }

  async execute(id: string, currentUserId?: string, correlationId?: string) {
    const movement = await this.findOne(id);

    if (movement.status !== CareerMovementStatusEnum.APPROVED) {
      throw new BadRequestException('Movement must be APPROVED before execution');
    }

    // Validate Effective Date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const effectiveDate = new Date(movement.effectiveDate);
    effectiveDate.setHours(0, 0, 0, 0);

    if (effectiveDate > today) {
      throw new BadRequestException('Cannot execute before effective date');
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: movement.employeeId },
      relations: { salaryStructures: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Apply New Values (if present)
    if (movement.newBranchId) employee.branchId = movement.newBranchId;
    if (movement.newDepartmentId) employee.departmentId = movement.newDepartmentId;
    if (movement.newDesignationId) employee.designationId = movement.newDesignationId;
    if (movement.newRoleId) employee.roleId = movement.newRoleId;
    if (movement.newShiftId) employee.shiftId = movement.newShiftId;

    // Handle Salary Structure Swap
    if (movement.newSalaryStructureId) {
      if (employee.salaryStructures) {
        for (const salary of employee.salaryStructures) {
          salary.isActive = false;
        }
      }
      // Note: Setting isActive back to true on the new structure requires updating the SalaryStructure entity itself.
      // For V1, we assume the new structure is already active or handled. 
      // We are just un-activating the old ones.
    }

    await this.employeeRepository.save(employee);

    // Update Movement Status
    movement.status = CareerMovementStatusEnum.EXECUTED;
    movement.executedBy = currentUserId || null;
    movement.executedAt = new Date();

    const savedMovement = await this.movementRepository.save(movement);

    if (currentUserId) {
      await this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Career Movements',
        action: ActivityAction.UPDATE,
        description: `Executed ${movement.movementType} for Employee ID ${movement.employeeId}`,
        entityType: 'EmployeeCareerMovement',
        entityId: savedMovement.id,
        newValue: savedMovement as unknown as Record<string, any>,
      });
    }

    return savedMovement;
  }
}
