import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveLedger, LeaveTransactionType } from '../leave-ledger/entities/leave-ledger.entity';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { LeavePolicy } from '../leave-policy/entities/leave-policy.entity';
import { CreateLeaveLedgerDto } from '../leave-ledger/dto/create-leave-ledger.dto';
import { Cron } from '@nestjs/schedule';
import { Employee } from '../employees/entities/employee.entity';

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
  ) {}

  // -------------------------------------------------------------
  // CORE: Transaction Processing
  // -------------------------------------------------------------
  async processTransaction(dto: CreateLeaveLedgerDto) {
    // 1. Save to Ledger
    const ledgerEntry = this.leaveLedgerRepo.create(dto);
    const savedLedger = await this.leaveLedgerRepo.save(ledgerEntry);

    // 2. Update Balance
    const year = new Date().getFullYear();
    let balance = await this.leaveBalanceRepo.findOne({
      where: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        year,
      },
    });

    if (!balance) {
      balance = this.leaveBalanceRepo.create({
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
        // When taking leave or encashing, the days value should be positive, meaning we add to 'used'
        balance.used = Number(balance.used) + Number(Math.abs(dto.days));
        break;
      case LeaveTransactionType.CARRY_FORWARD:
        balance.carriedForward = Number(balance.carriedForward) + Number(dto.days);
        break;
      case LeaveTransactionType.ADJUSTMENT:
        // For adjustments, if positive, we add to accrued. If negative, we subtract from accrued.
        balance.accrued = Number(balance.accrued) + Number(dto.days);
        break;
    }

    await this.leaveBalanceRepo.save(balance);

    return savedLedger;
  }

  // -------------------------------------------------------------
  // PUBLIC APIS (Triggered by HR / Events)
  // -------------------------------------------------------------
  async manualAdjustment(employeeId: string, leaveTypeId: string, days: number, remarks: string, hrUserId?: string) {
    if (days === 0) throw new BadRequestException('Adjustment days cannot be zero');

    return this.processTransaction({
      employeeId,
      leaveTypeId,
      transactionType: LeaveTransactionType.ADJUSTMENT,
      days,
      referenceId: hrUserId, // optionally store who made the adjustment
      remarks: remarks || 'Manual Adjustment by HR',
    });
  }

  // -------------------------------------------------------------
  // ACCRUAL ENGINE (Cron & Business Logic)
  // -------------------------------------------------------------
  
  // Example: Run on the 1st of every month at midnight
  @Cron('0 0 1 * *', { timeZone: 'Asia/Kolkata' })
  async executeMonthlyAccrual() {
    // 1. Fetch all active policies with MONTHLY accrual
    const policies = await this.leavePolicyRepo.find({
      where: { isActive: true, accrualFrequency: 'MONTHLY' as any },
    });

    for (const policy of policies) {
      if (policy.accrualRate <= 0) continue;

      // In a real system, you'd fetch employees based on the policy's scope (ORGANIZATION, BRANCH, etc)
      // Here, we'll assume we have a helper to get eligible employees
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
  }

  @Cron('0 0 1 1 *', { timeZone: 'Asia/Kolkata' })
  async executeYearlyAccrual() {
    const policies = await this.leavePolicyRepo.find({
      where: { isActive: true, accrualFrequency: 'YEARLY' as any },
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
  }

  private async getEligibleEmployeesForPolicy(policy: LeavePolicy): Promise<string[]> {
    // Phase 1 implementation: organization wide
    const employees = await this.employeeRepo.find({
      select: { id: true },
      where: { isActive: true },
    });
    return employees.map((e) => e.id);
  }
}
