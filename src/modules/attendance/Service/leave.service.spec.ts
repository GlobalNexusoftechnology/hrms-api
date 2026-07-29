import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Leave } from '../entities/leave.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Attendance } from '../entities/attendance.entity';
import { LeavePolicy } from '../../leave-policy/entities/leave-policy.entity';
import { LeaveBalance } from '../../leave-balance/entities/leave-balance.entity';
import { Holiday } from '../../holiday/entities/holiday.entity';
import { WeekendSetting } from '../../weekend_settings/entities/weekend_setting.entity';
import { LeaveEngineService } from '../../leave-engine/leave-engine.service';
import { DataScopeService } from '../../../common/services/data-scope.service';
import { NotificationService } from '../../notification/notification.service';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

describe('LeaveService', () => {
  let service: LeaveService;
  let leaveRepo: any;
  let employeeRepo: any;
  let attendanceRepo: any;
  let leavePolicyRepo: any;
  let leaveBalanceRepo: any;
  let holidayRepo: any;
  let weekendRepo: any;
  let leaveEngineService: any;
  let notificationService: any;
  let mockEntityManager: any;
  let localLeave: any;

  const mockLeaveTemplate = {
    id: 'leave-123',
    employeeId: 'emp-123',
    leaveTypeId: 'type-123',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    reason: 'Vacation',
    status: LeaveStatusEnum.PENDING,
  };

  const mockPolicy = {
    id: 'policy-123',
    leaveTypeId: 'type-123',
    isActive: true,
    noticeDays: 0,
    gender: 'ALL',
    minimumServiceDays: 0,
    requiresApproval: true,
    allowNegativeBalance: false,
    maxNegativeBalance: 0,
    countWeekend: false,
    countHoliday: false,
  };

  const mockRepository = () => ({
    create: jest.fn().mockImplementation((dto) => ({ ...localLeave, ...dto })),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
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

    const mockLeaveEngineService = {
      processTransaction: jest.fn().mockResolvedValue({ id: 'ledger-123' }),
    };

    const mockDataScopeService = {
      applyScope: jest.fn(),
    };

    const mockNotificationService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        { provide: getRepositoryToken(LeavePolicy), useFactory: mockRepository },
        { provide: getRepositoryToken(LeaveBalance), useFactory: mockRepository },
        { provide: getRepositoryToken(Holiday), useFactory: mockRepository },
        { provide: getRepositoryToken(WeekendSetting), useFactory: mockRepository },
        { provide: LeaveEngineService, useValue: mockLeaveEngineService },
        { provide: DataScopeService, useValue: mockDataScopeService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    leaveRepo = module.get(getRepositoryToken(Leave));
    employeeRepo = module.get(getRepositoryToken(Employee));
    attendanceRepo = module.get(getRepositoryToken(Attendance));
    leavePolicyRepo = module.get(getRepositoryToken(LeavePolicy));
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalance));
    holidayRepo = module.get(getRepositoryToken(Holiday));
    weekendRepo = module.get(getRepositoryToken(WeekendSetting));
    leaveEngineService = module.get<LeaveEngineService>(LeaveEngineService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestLeave', () => {
    const createDto = {
      leaveTypeId: 'type-123',
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      reason: 'Vacation',
    };

    it('should successfully create leave if dates are valid and no overlaps exist', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      leaveRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      leavePolicyRepo.findOne.mockResolvedValue(mockPolicy);
      employeeRepo.findOne.mockResolvedValue({ id: 'emp-123', gender: 'ALL', joiningDate: '2025-01-01' });
      leaveBalanceRepo.findOne.mockResolvedValue({ accrued: 10, carriedForward: 0, used: 0 });
      weekendRepo.find.mockResolvedValue([]);
      holidayRepo.find.mockResolvedValue([]);

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
      mockEntityManager.findOne
        .mockResolvedValueOnce(localLeave) // leave
        .mockResolvedValueOnce(mockPolicy); // policy
      attendanceRepo.findOne.mockResolvedValue(null);
      weekendRepo.find.mockResolvedValue([]);
      holidayRepo.find.mockResolvedValue([]);

      const result = await service.reviewLeave(
        'leave-123',
        LeaveStatusEnum.APPROVED,
        'hr-123',
        'Fine',
      );

      expect(leaveEngineService.processTransaction).toHaveBeenCalled();
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
