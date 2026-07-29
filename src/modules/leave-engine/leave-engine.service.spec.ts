import { Test, TestingModule } from '@nestjs/testing';
import { LeaveEngineService } from './leave-engine.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveLedger, LeaveTransactionType } from '../leave-ledger/entities/leave-ledger.entity';
import { LeaveBalance } from '../leave-balance/entities/leave-balance.entity';
import { LeavePolicy } from '../leave-policy/entities/leave-policy.entity';
import { Employee } from '../employees/entities/employee.entity';
import { BadRequestException } from '@nestjs/common';

describe('LeaveEngineService', () => {
  let service: LeaveEngineService;
  let leaveLedgerRepo: any;
  let leaveBalanceRepo: any;
  let leavePolicyRepo: any;
  let employeeRepo: any;

  const mockRepository = () => ({
    create: jest.fn().mockImplementation((dto) => ({ id: 'ledger-1', ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveEngineService,
        { provide: getRepositoryToken(LeaveLedger), useFactory: mockRepository },
        { provide: getRepositoryToken(LeaveBalance), useFactory: mockRepository },
        { provide: getRepositoryToken(LeavePolicy), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<LeaveEngineService>(LeaveEngineService);
    leaveLedgerRepo = module.get(getRepositoryToken(LeaveLedger));
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalance));
    leavePolicyRepo = module.get(getRepositoryToken(LeavePolicy));
    employeeRepo = module.get(getRepositoryToken(Employee));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processTransaction', () => {
    it('should create ledger entry and update balance for ACCRUAL', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue(null);

      const result = await service.processTransaction({
        employeeId: 'emp-123',
        leaveTypeId: 'type-123',
        transactionType: LeaveTransactionType.ACCRUAL,
        days: 5,
        remarks: 'Monthly Accrual',
      });

      expect(result.id).toBe('ledger-1');
      expect(leaveBalanceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          accrued: 5,
        }),
      );
    });

    it('should update balance used for LEAVE_TAKEN', async () => {
      const existingBalance = { accrued: 10, used: 2, carriedForward: 0 };
      leaveBalanceRepo.findOne.mockResolvedValue(existingBalance);

      await service.processTransaction({
        employeeId: 'emp-123',
        leaveTypeId: 'type-123',
        transactionType: LeaveTransactionType.LEAVE_TAKEN,
        days: 3,
        remarks: 'Leave approved',
      });

      expect(leaveBalanceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          used: 5, // 2 + 3
        }),
      );
    });
  });

  describe('manualAdjustment', () => {
    it('should throw BadRequestException if days is 0', async () => {
      await expect(
        service.manualAdjustment('emp-123', 'type-123', 0, 'No change'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process transaction for valid adjustment days', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue({ accrued: 10, used: 0, carriedForward: 0 });

      const result = await service.manualAdjustment(
        'emp-123',
        'type-123',
        2,
        'Adjustment',
        'hr-123',
      );

      expect(result.id).toBe('ledger-1');
    });
  });
});
