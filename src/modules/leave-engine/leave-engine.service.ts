import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import {
  LeaveLedger,
  LeaveTransactionType,
} from '../leave-ledger/entities/leave-ledger.entity';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { LeavePolicy } from '../leave-policy/entities/leave-policy.entity';
import { CreateLeaveLedgerDto } from '../leave-ledger/dto/create-leave-ledger.dto';
import { Cron } from '@nestjs/schedule';
import { Employee } from '../employees/entities/employee.entity';
import { TenantQueryService } from "../../common/services/tenant-query.service";
import { DataScopeService } from '../../common/services/data-scope.service';
import { TenantExecutionService } from '../../common/services/tenant-execution.service';

@Injectable()
export class LeaveEngineService {
  constructor(
    @InjectRepository(LeaveLedger)
    private readonly leaveLedgerRepo: Repository<LeaveLedger>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeavePolicy)
    private readonly leavePolicyRepo: Repository<LeavePolicy>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly dataSource: DataSource,
    private readonly tenantQueryService: TenantQueryService,
    private readonly dataScopeService: DataScopeService,
    private readonly tenantExecutionService: TenantExecutionService,
  ) {}

  // -------------------------------------------------------------
  // CORE: Transaction Processing
  // -------------------------------------------------------------
  async processTransaction(dto: CreateLeaveLedgerDto, manager?: EntityManager) {
    const runInTransaction = async (m: EntityManager) => {
      // 1. Save to Ledger
      const ledgerEntry = m.create(LeaveLedger, dto);
      const savedLedger = await m.save(ledgerEntry);

      // 2. Update Balance
      const year = new Date().getFullYear();
      let balance = await m.findOne(LeaveBalance, {
        where: {
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!balance) {
        balance = m.create(LeaveBalance, {
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year,
          accrued: 0,
          used: 0,
          carriedForward: 0,
        });
      }

      switch (dto.transactionType) {
        case LeaveTransactionType.ACCRUAL:
          balance.accrued = Number(balance.accrued) + Number(dto.days);
          break;
        case LeaveTransactionType.LEAVE_TAKEN:
        case LeaveTransactionType.ENCASHMENT:
          balance.used = Number(balance.used) + Number(Math.abs(dto.days));
          break;
        case LeaveTransactionType.CARRY_FORWARD:
          balance.carriedForward =
            Number(balance.carriedForward) + Number(dto.days);
          break;
        case LeaveTransactionType.ADJUSTMENT:
          balance.accrued = Number(balance.accrued) + Number(dto.days);
          break;
      }

      await m.save(balance);

      return savedLedger;
    };

    if (manager) {
      return runInTransaction(manager);
    } else {
      return this.dataSource.transaction(runInTransaction);
    }
  }

  // -------------------------------------------------------------
  // PUBLIC APIS (Triggered by HR / Events)
  // -------------------------------------------------------------
  async manualAdjustment(
    employeeId: string,
    leaveTypeId: string,
    days: number,
    remarks: string,
    currentUser?: any,
  ) {
    if (days === 0)
      throw new BadRequestException('Adjustment days cannot be zero');

    if (currentUser) {
      const { tenantId } = this.tenantQueryService.getTenantWhereClause();
      const qb = this.employeeRepo.createQueryBuilder('employee')
        .where('employee.id = :employeeId', { employeeId })
        .andWhere('employee.tenantId = :tenantId', { tenantId });

      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'employee.branchId',
        department: 'employee.departmentId',
      });

      const emp = await qb.getOne();
      if (!emp) throw new NotFoundException('Employee not found or access denied for adjustment');
    }

    return this.processTransaction({
      employeeId,
      leaveTypeId,
      transactionType: LeaveTransactionType.ADJUSTMENT,
      days,
      referenceId: currentUser?.id, // optionally store who made the adjustment
      remarks: remarks || 'Manual Adjustment by HR',
    });
  }

  // -------------------------------------------------------------
  // ACCRUAL ENGINE (Cron & Business Logic)
  // -------------------------------------------------------------

  // Run on the 1st of every month at midnight
  @Cron('0 0 1 * *', { timeZone: 'Asia/Kolkata' })
  async executeMonthlyAccrual() {
    await this.tenantExecutionService.forEachActiveTenant('Monthly Leave Accrual', async () => {
      const currentTenantId = this.tenantQueryService.getTenantWhereClause().tenantId;
      const policies = await this.leavePolicyRepo.find({
        where: {
          isActive: true,
          accrualFrequency: 'MONTHLY' as any,
          tenantId: currentTenantId,
        },
      });

      for (const policy of policies) {
        if (policy.accrualRate <= 0) continue;

        const eligibleEmployeeIds = await this.getEligibleEmployeesForPolicy(policy);

        for (const empId of eligibleEmployeeIds) {
          await this.processTransaction({
            employeeId: empId,
            leaveTypeId: policy.leaveTypeId,
            transactionType: LeaveTransactionType.ACCRUAL,
            days: policy.accrualRate,
            remarks: 'Automated Monthly Accrual',
          });
        }
      }
    });
  }

  @Cron('0 0 1 1 *', { timeZone: 'Asia/Kolkata' })
  async executeYearlyAccrual() {
    await this.tenantExecutionService.forEachActiveTenant('Yearly Leave Accrual', async () => {
      const currentTenantId = this.tenantQueryService.getTenantWhereClause().tenantId;
      const policies = await this.leavePolicyRepo.find({
        where: {
          isActive: true,
          accrualFrequency: 'YEARLY' as any,
          tenantId: currentTenantId,
        },
      });

      for (const policy of policies) {
        if (policy.annualQuota <= 0) continue;

        const eligibleEmployeeIds = await this.getEligibleEmployeesForPolicy(policy);

        for (const empId of eligibleEmployeeIds) {
          await this.processTransaction({
            employeeId: empId,
            leaveTypeId: policy.leaveTypeId,
            transactionType: LeaveTransactionType.ACCRUAL,
            days: policy.annualQuota,
            remarks: 'Automated Yearly Accrual',
          });
        }
      }
    });
  }

  private async getEligibleEmployeesForPolicy(
    policy: LeavePolicy,
  ): Promise<string[]> {
    const currentTenantId = this.tenantQueryService.getTenantWhereClause().tenantId;
    const employees = await this.employeeRepo.find({
      select: { id: true },
      where: {
        isActive: true,
        tenantId: currentTenantId,
      },
    });
    return employees.map((e) => e.id);
  }
}
