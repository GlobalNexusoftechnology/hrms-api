import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Leave } from '../entities/leave.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Attendance } from '../entities/attendance.entity';
import { LeaveBalanceService } from '../../leave-balance/leave-balance.service';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

describe('LeaveService', () => {
  let service: LeaveService;
  let leaveRepo: any;
  let attendanceRepo: any;
  let leaveBalanceService: any;
  let mockEntityManager: any;
  let localLeave: any;

  const mockLeaveTemplate = {
    id: 'leave-123',
    employeeId: 'emp-123',
    startDate: '2026-06-30',
    endDate: '2026-07-02',
    type: 'Sick',
    reason: 'Flu',
    status: LeaveStatusEnum.PENDING,
  };

  const mockRepository = () => ({
    create: jest.fn().mockImplementation((dto) => ({ ...localLeave, ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    localLeave = { ...mockLeaveTemplate };

    mockEntityManager = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    const mockDataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
    };

    const mockLeaveBalanceService = {
      deductLeave: jest.fn().mockResolvedValue({
        paidLeaves: 3,
        unpaidLeaves: 0,
        remainingLeaves: 12,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        { provide: LeaveBalanceService, useValue: mockLeaveBalanceService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    leaveRepo = module.get(getRepositoryToken(Leave));
    attendanceRepo = module.get(getRepositoryToken(Attendance));
    leaveBalanceService = module.get<LeaveBalanceService>(LeaveBalanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestLeave', () => {
    const createDto = {
      startDate: '2026-06-30',
      endDate: '2026-07-02',
      type: 'Sick',
      reason: 'Flu',
    };

    it('should successfully create leave if dates are valid and no overlaps exist', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      leaveRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.requestLeave('emp-123', createDto as any);
      expect(result.employeeId).toBe('emp-123');
    });

    it('should throw BadRequestException if startDate is in past', async () => {
      const invalidDto = { ...createDto, startDate: '2020-01-01' };
      await expect(
        service.requestLeave('emp-123', invalidDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if overlap found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(localLeave),
      };
      leaveRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.requestLeave('emp-123', createDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyLeaves', () => {
    it('should build query and return list', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([localLeave]),
      };
      leaveRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getMyLeaves('emp-123', 'APPROVED');
      expect(result).toEqual([localLeave]);
    });
  });

  describe('cancelLeave', () => {
    it('should cancel leave request if status is PENDING', async () => {
      leaveRepo.findOne.mockResolvedValue(localLeave);

      const result = await service.cancelLeave('leave-123', 'emp-123');
      expect(result.status).toBe(LeaveStatusEnum.CANCELLED);
    });

    it('should throw BadRequestException if leave is already approved', async () => {
      localLeave.status = LeaveStatusEnum.APPROVED;
      leaveRepo.findOne.mockResolvedValue(localLeave);
      await expect(service.cancelLeave('leave-123', 'emp-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reviewLeave', () => {
    it('should approve leave, deduct balance, and create attendance records within transaction', async () => {
      mockEntityManager.findOne.mockResolvedValue(localLeave);
      attendanceRepo.findOne.mockResolvedValue(null);

      const result = await service.reviewLeave(
        'leave-123',
        LeaveStatusEnum.APPROVED,
        'hr-123',
        'Fine',
      );

      expect(leaveBalanceService.deductLeave).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if leave not found in review', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      await expect(
        service.reviewLeave('invalid', LeaveStatusEnum.APPROVED, 'hr-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
