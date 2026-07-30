import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Resignation } from './entities/resignation.entity';
import { Employee } from '../employees/entities/employee.entity';
import { OrganizationSettings } from '../organization/entities/organization-settings.entity';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { ApproveResignationDto } from './dto/approve-resignation.dto';
import { ResignationStatusEnum } from '../../common/enums/resignation-status.enum';
import { EmploymentStatusEnum } from '../../common/enums/employment-status.enum';
import { RoleEnum } from '../../common/enums/role.enum';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../activity-log/enums/activity-action.enum';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import dayjs from 'dayjs';

@Injectable()
export class ResignationsService {
  constructor(
    @InjectRepository(Resignation)
    private readonly resignationRepository: Repository<Resignation>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(OrganizationSettings)
    private readonly orgSettingsRepository: Repository<OrganizationSettings>,
    private readonly activityLogService: ActivityLogService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    employeeId: string,
    dto: CreateResignationDto,
    currentUserId?: string,
    correlationId?: string,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: { branch: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (
      employee.employmentStatus === EmploymentStatusEnum.RESIGNED ||
      employee.employmentStatus === EmploymentStatusEnum.TERMINATED
    ) {
      throw new BadRequestException(
        'Employee is already resigned or terminated.',
      );
    }

    // Notice Period Logic
    let isShortfall = false;
    let shortfallReason: string | null = null;

    if (employee.branch?.organizationId) {
      const settings = await this.orgSettingsRepository.findOne({
        where: { organizationId: employee.branch.organizationId },
      });
      if (settings?.noticePeriodDays) {
        const minimumLastWorkingDate = dayjs()
          .add(settings.noticePeriodDays, 'day')
          .startOf('day');
        const requestedDate = dayjs(dto.requestedLastWorkingDate).startOf(
          'day',
        );

        if (requestedDate.isBefore(minimumLastWorkingDate)) {
          isShortfall = true;
          shortfallReason = `Requested date is before the mandatory ${settings.noticePeriodDays} days notice period.`;
        }
      }
    }

    const resignation = this.resignationRepository.create({
      employeeId,
      resignationDate: new Date(),
      requestedLastWorkingDate: new Date(dto.requestedLastWorkingDate),
      reason: dto.reason,
      remarks: dto.remarks,
      status: ResignationStatusEnum.PENDING,
      isShortfall,
      shortfallReason,
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
      relations: { employee: { branch: true } },
    });

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }
    return resignation;
  }

  async approve(
    id: string,
    dto: ApproveResignationDto,
    currentUserId: string,
    correlationId?: string,
  ) {
    const resignation = await this.findOne(id);

    if (resignation.status !== ResignationStatusEnum.PENDING) {
      throw new BadRequestException(
        'Only PENDING resignations can be approved.',
      );
    }

    if (resignation.employeeId === currentUserId) {
      throw new ForbiddenException(
        'You cannot approve your own resignation request.',
      );
    }

    // Organization Isolation Check
    const currentUser = await this.employeeRepository.findOne({
      where: { id: currentUserId },
      relations: { branch: true, role: true },
    });

    if (
      currentUser?.role?.name !== RoleEnum.SUPER_ADMIN &&
      currentUser?.branch?.organizationId !==
        resignation.employee?.branch?.organizationId
    ) {
      throw new ForbiddenException(
        'Cannot approve resignation outside your organization.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      resignation.status = ResignationStatusEnum.APPROVED;
      resignation.approvedLastWorkingDate = dto.approvedLastWorkingDate
        ? new Date(dto.approvedLastWorkingDate)
        : resignation.requestedLastWorkingDate;

      if (dto.shortfallReason) {
        resignation.shortfallReason = dto.shortfallReason;
      }

      resignation.approvedBy = currentUserId;
      resignation.approvedAt = new Date();

      const savedResignation = await queryRunner.manager.save(
        Resignation,
        resignation,
      );

      const employee = await queryRunner.manager.findOne(Employee, {
        where: { id: resignation.employeeId },
      });
      if (employee) {
        employee.employmentStatus = EmploymentStatusEnum.NOTICE_PERIOD;
        await queryRunner.manager.save(Employee, employee);
      }

      await queryRunner.commitTransaction();

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

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async execute(id: string, currentUserId: string, correlationId?: string) {
    const resignation = await this.findOne(id);

    if (resignation.status !== ResignationStatusEnum.APPROVED) {
      throw new BadRequestException(
        'Only APPROVED resignations can be executed.',
      );
    }

    if (
      resignation.approvedLastWorkingDate &&
      dayjs()
        .startOf('day')
        .isBefore(dayjs(resignation.approvedLastWorkingDate).startOf('day'))
    ) {
      throw new BadRequestException(
        'Cannot execute resignation before the approved last working date.',
      );
    }

    // Organization Isolation Check
    const currentUser = await this.employeeRepository.findOne({
      where: { id: currentUserId },
      relations: { branch: true, role: true },
    });

    if (
      currentUser?.role?.name !== RoleEnum.SUPER_ADMIN &&
      currentUser?.branch?.organizationId !==
        resignation.employee?.branch?.organizationId
    ) {
      throw new ForbiddenException(
        'Cannot execute resignation outside your organization.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      resignation.status = ResignationStatusEnum.EXECUTED;
      resignation.executedBy = currentUserId;
      resignation.executedAt = new Date();

      const savedResignation = await queryRunner.manager.save(
        Resignation,
        resignation,
      );

      const employee = await queryRunner.manager.findOne(Employee, {
        where: { id: resignation.employeeId },
      });
      if (employee) {
        employee.employmentStatus = EmploymentStatusEnum.RESIGNED;
        employee.isActive = false; // Disable login / active status
        await queryRunner.manager.save(Employee, employee);

        // Revoke active refresh tokens
        await queryRunner.manager.update(
          RefreshToken,
          { employeeId: employee.id, isRevoked: false },
          { isRevoked: true },
        );
      }

      await queryRunner.commitTransaction();

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

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
