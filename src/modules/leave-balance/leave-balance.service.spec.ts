import { Test, TestingModule } from '@nestjs/testing';
import { LeaveBalanceService } from './leave-balance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { Employee } from '../employees/entities/employee.entity';

describe('LeaveBalanceService', () => {
  let service: LeaveBalanceService;
  let leaveBalanceRepo: any;
  let employeeRepo: any;

  const mockLeaveBalance = {
    id: 'bal-123',
    employeeId: 'emp-123',
    leaveTypeId: 'type-123',
    year: 2026,
    accrued: 10,
    used: 2,
    carriedForward: 2,
    leaveType: {
      id: 'type-123',
      name: 'Casual Leave',
      code: 'CL',
    },
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

  describe('getEmployeeBalance', () => {
    it('should return calculated balance per leave type', async () => {
      leaveBalanceRepo.find.mockResolvedValue([mockLeaveBalance]);

      const result = await service.getEmployeeBalance('emp-123', 2026);
      expect(result).toHaveLength(1);
      expect(result[0].remaining).toBe(10); // (10 + 2) - 2 = 10
      expect(result[0].leaveType.code).toBe('CL');
    });
  });

  describe('getAllBalances', () => {
    it('should query all balances paginated', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockLeaveBalance], 1]),
      };
      leaveBalanceRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllBalances({
        page: 1,
        limit: 10,
        year: 2026,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].employeeName).toBe('John Doe');
      expect(result.data[0].remaining).toBe(10);
      expect(result.meta.total).toBe(1);
    });
  });
});
