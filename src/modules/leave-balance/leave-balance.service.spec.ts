import { Test, TestingModule } from '@nestjs/testing';
import { LeaveBalanceService } from './leave-balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotFoundException } from '@nestjs/common';

describe('LeaveBalanceService', () => {
  let service: LeaveBalanceService;
  let leaveBalanceRepo: any;
  let employeeRepo: any;

  const mockLeaveBalance = {
    id: 'bal-123',
    employeeId: 'emp-123',
    month: 6,
    year: 2026,
    monthlyCredit: 2,
    carryForward: 4,
    usedLeaves: 0,
    paidLeavesUsed: 0,
    unpaidLeavesUsed: 0,
    remainingLeaves: 6,
    employee: {
      id: 'emp-123',
      firstName: 'John',
      lastName: 'Doe',
      employeeCode: 'EMP-001',
    },
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveBalanceService,
        {
          provide: getRepositoryToken(LeaveBalance),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<LeaveBalanceService>(LeaveBalanceService);
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalance));
    employeeRepo = module.get(getRepositoryToken(Employee));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deductLeave', () => {
    it('should deduct leave balance successfully', async () => {
      const activeBalance = { ...mockLeaveBalance };
      leaveBalanceRepo.findOne.mockResolvedValue(activeBalance);
      leaveBalanceRepo.save.mockResolvedValue(activeBalance);

      const result = await service.deductLeave('emp-123', 2);
      expect(result.paidLeaves).toBe(2);
      expect(result.remainingLeaves).toBe(4);
      expect(leaveBalanceRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if balance does not exist', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue(null);
      await expect(service.deductLeave('emp-123', 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEmployeeBalance', () => {
    it('should return balance if it already exists', async () => {
      leaveBalanceRepo.findOne.mockResolvedValue(mockLeaveBalance);

      const result = await service.getEmployeeBalance('emp-123');
      expect(result.remainingLeaves).toBe(6);
    });
  });
});
