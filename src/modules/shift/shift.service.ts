import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import dayjs from 'dayjs';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { TenantQueryService } from '../../common/services/tenant-query.service';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
    private readonly tenantQueryService: TenantQueryService,
  ) {}

  private validateBreakAndShiftBounds(
    standardWorkingMinutes: number,
    totalBreakMinutes?: number,
  ) {
    if (
      totalBreakMinutes !== undefined &&
      totalBreakMinutes >= standardWorkingMinutes
    ) {
      throw new BadRequestException(
        'Total break duration cannot equal or exceed standard working minutes.',
      );
    }
  }

  async create(createShiftDto: CreateShiftDto, userId?: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    // Check duplicate name OR code within this tenant
    const existing = await this.shiftRepo.findOne({
      where: [
        { name: createShiftDto.name, tenantId },
        { code: createShiftDto.code, tenantId },
      ],
    });
    if (existing) {
      throw new ConflictException(
        'A shift with this name or code already exists in your organization.',
      );
    }

    const workingMinutes = createShiftDto.standardWorkingMinutes ?? 480;
    const breakMinutes = createShiftDto.maxAllowedBreakMinutes ?? createShiftDto.totalBreakMinutes ?? 60;
    this.validateBreakAndShiftBounds(workingMinutes, breakMinutes);

    const shift = this.shiftRepo.create({
      ...createShiftDto,
      maxAllowedBreakMinutes: breakMinutes,
      totalBreakMinutes: breakMinutes,
      tenantId,
      createdByUserId: userId,
    });
    return this.shiftRepo.save(shift);
  }

  findAll() {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    return this.shiftRepo.find({ where: { tenantId } });
  }

  async findOne(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const shift = await this.shiftRepo.findOne({ where: { id, tenantId } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto, userId?: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const shift = await this.findOne(id); // already tenant-scoped

    // Tenant-scoped duplicate check for update (excluding current shift id)
    if (updateShiftDto.code || updateShiftDto.name) {
      const existing = await this.shiftRepo.findOne({
        where: [
          { name: updateShiftDto.name ?? shift.name, tenantId, id: Not(id) },
          { code: updateShiftDto.code ?? shift.code, tenantId, id: Not(id) },
        ],
      });
      if (existing) {
        throw new ConflictException(
          'A shift with this name or code already exists in your organization.',
        );
      }
    }

    Object.assign(shift, updateShiftDto, { updatedByUserId: userId });

    const breakMinutes = shift.maxAllowedBreakMinutes ?? shift.totalBreakMinutes ?? 60;
    this.validateBreakAndShiftBounds(shift.standardWorkingMinutes, breakMinutes);

    return this.shiftRepo.save(shift);
  }

  async remove(id: string) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const shift = await this.findOne(id); // already tenant-scoped

    // Verify shift is not assigned to active employees, branches, or organizations
    const assignedEmployees = await this.shiftRepo.manager.query(
      `SELECT 1 FROM employees WHERE shift_id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, tenantId],
    );
    if (assignedEmployees.length > 0) {
      throw new BadRequestException(
        'Cannot delete shift: it is currently assigned to active employees.',
      );
    }

    const assignedBranches = await this.shiftRepo.manager.query(
      `SELECT 1 FROM branches WHERE default_shift_id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, tenantId],
    );
    if (assignedBranches.length > 0) {
      throw new BadRequestException(
        'Cannot delete shift: it is currently set as default shift for a branch.',
      );
    }

    const assignedOrgs = await this.shiftRepo.manager.query(
      `SELECT 1 FROM organizations WHERE default_shift_id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, tenantId],
    );
    if (assignedOrgs.length > 0) {
      throw new BadRequestException(
        'Cannot delete shift: it is currently set as default shift for an organization.',
      );
    }

    return this.shiftRepo.remove(shift);
  }
}

