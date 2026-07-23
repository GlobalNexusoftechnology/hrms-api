import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resignation } from './entities/resignation.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { ResignationStatusEnum } from '../../common/enums/resignation-status.enum';
import { EmploymentStatusEnum } from '../../common/enums/employment-status.enum';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../activity-log/enums/activity-action.enum';

@Injectable()
export class ResignationsService {
  constructor(
    @InjectRepository(Resignation)
    private readonly resignationRepository: Repository<Resignation>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(employeeId: string, dto: CreateResignationDto, currentUserId?: string, correlationId?: string) {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.employmentStatus === EmploymentStatusEnum.RESIGNED || employee.employmentStatus === EmploymentStatusEnum.TERMINATED) {
      throw new BadRequestException('Employee is already resigned or terminated.');
    }

    const resignation = this.resignationRepository.create({
      employeeId,
      resignationDate: new Date(),
      requestedLastWorkingDate: new Date(dto.requestedLastWorkingDate),
      reason: dto.reason,
      remarks: dto.remarks,
      status: ResignationStatusEnum.PENDING,
    });

    const savedResignation = await this.resignationRepository.save(resignation);

    if (currentUserId) {
      this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Resignations',
        action: ActivityAction.CREATE,
        description: `Submitted resignation request for Employee ${employeeId}`,
        entityType: 'Resignation',
        entityId: savedResignation.id,
        correlationId,
      });
    }

    return savedResignation;
  }

  async findAll() {
    return this.resignationRepository.find({
      relations: { employee: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.resignationRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const resignation = await this.resignationRepository.findOne({ 
      where: { id },
      relations: { employee: true }
    });

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }
    return resignation;
  }

  async approve(id: string, currentUserId?: string, correlationId?: string) {
    const resignation = await this.findOne(id);

    if (resignation.status !== ResignationStatusEnum.PENDING) {
      throw new BadRequestException('Only PENDING resignations can be approved.');
    }

    resignation.status = ResignationStatusEnum.APPROVED;
    resignation.approvedLastWorkingDate = resignation.requestedLastWorkingDate; // Simple workflow default
    resignation.approvedBy = currentUserId || null;
    resignation.approvedAt = new Date();

    const savedResignation = await this.resignationRepository.save(resignation);

    // Update Employee Status to NOTICE_PERIOD
    const employee = await this.employeeRepository.findOne({ where: { id: resignation.employeeId }});
    if (employee) {
      employee.employmentStatus = EmploymentStatusEnum.NOTICE_PERIOD;
      await this.employeeRepository.save(employee);
    }

    if (currentUserId) {
      this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Resignations',
        action: ActivityAction.APPROVE,
        description: `Approved resignation for Employee ${resignation.employeeId}`,
        entityType: 'Resignation',
        entityId: savedResignation.id,
        correlationId,
      });
    }

    return savedResignation;
  }

  async execute(id: string, currentUserId?: string, correlationId?: string) {
    const resignation = await this.findOne(id);

    if (resignation.status !== ResignationStatusEnum.APPROVED) {
      throw new BadRequestException('Only APPROVED resignations can be executed.');
    }

    resignation.status = ResignationStatusEnum.EXECUTED;
    resignation.executedBy = currentUserId || null;
    resignation.executedAt = new Date();

    const savedResignation = await this.resignationRepository.save(resignation);

    // Update Employee Status to RESIGNED and disable them
    const employee = await this.employeeRepository.findOne({ where: { id: resignation.employeeId }});
    if (employee) {
      employee.employmentStatus = EmploymentStatusEnum.RESIGNED;
      employee.isActive = false; // Disable login / active status
      await this.employeeRepository.save(employee);
    }

    if (currentUserId) {
      this.activityLogService.logAction({
        userId: currentUserId,
        module: 'Resignations',
        action: ActivityAction.UPDATE, // Using UPDATE as EXECUTED isn't in ActivityAction
        description: `Executed exit process for Employee ${resignation.employeeId}`,
        entityType: 'Resignation',
        entityId: savedResignation.id,
        correlationId,
      });
    }

    return savedResignation;
  }
}
