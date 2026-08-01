import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaveLedgerDto } from './dto/create-leave-ledger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveLedger } from './entities/leave-ledger.entity';
import { Repository } from 'typeorm';
import { TenantQueryService } from "../../common/services/tenant-query.service";
import { DataScopeService } from '../../common/services/data-scope.service';

@Injectable()
export class LeaveLedgerService {
  constructor(
    @InjectRepository(LeaveLedger)
    private readonly leaveLedgerRepo: Repository<LeaveLedger>,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService
  ) {}

  async create(createLeaveLedgerDto: CreateLeaveLedgerDto) {
    const entry = this.leaveLedgerRepo.create(createLeaveLedgerDto);
    return this.leaveLedgerRepo.save(entry);
  }

  findAllByEmployee(employeeId: string, year?: number, currentUser?: any) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const qb = this.leaveLedgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.leaveType', 'leaveType')
      .leftJoinAndSelect('ledger.employee', 'employee')
      .where('ledger.employeeId = :employeeId', { employeeId })
      .andWhere('ledger.tenantId = :tenantId', { tenantId })
      .orderBy('ledger.createdAt', 'DESC');

    if (year) {
      qb.andWhere('EXTRACT(YEAR FROM ledger.created_at) = :year', { year });
    }

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
      });
    }

    return qb.getMany();
  }

  async findOne(id: string, currentUser?: any) {
    const { tenantId } = this.tenantQueryService.getTenantWhereClause();
    const qb = this.leaveLedgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.leaveType', 'leaveType')
      .leftJoinAndSelect('ledger.employee', 'employee')
      .where('ledger.id = :id', { id })
      .andWhere('ledger.tenantId = :tenantId', { tenantId });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
      });
    }

    const entry = await qb.getOne();

    if (!entry) {
      throw new NotFoundException('Leave ledger entry not found');
    }

    return entry;
  }
}
