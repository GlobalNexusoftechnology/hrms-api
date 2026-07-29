import { Test, TestingModule } from '@nestjs/testing';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveEngineService } from '../leave-engine/leave-engine.service';

describe('LeaveBalanceController', () => {
  let controller: LeaveBalanceController;
  let service: LeaveBalanceService;
  let engineService: LeaveEngineService;

  const mockLeaveBalanceService = {
    getEmployeeBalance: jest.fn().mockResolvedValue([{ remaining: 10 }]),
    getAllBalances: jest.fn().mockResolvedValue({ data: [] }),
  };

  const mockLeaveEngineService = {
    manualAdjustment: jest.fn().mockResolvedValue({ id: 'ledger-123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveBalanceController],
      providers: [
        {
          provide: LeaveBalanceService,
          useValue: mockLeaveBalanceService,
        },
        {
          provide: LeaveEngineService,
          useValue: mockLeaveEngineService,
        },
      ],
    }).compile();

    controller = module.get<LeaveBalanceController>(LeaveBalanceController);
    service = module.get<LeaveBalanceService>(LeaveBalanceService);
    engineService = module.get<LeaveEngineService>(LeaveEngineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyBalance', () => {
    it('should call getEmployeeBalance', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getMyBalance(user, 2026);
      expect(result).toEqual([{ remaining: 10 }]);
      expect(mockLeaveBalanceService.getEmployeeBalance).toHaveBeenCalledWith(
        'emp-123',
        2026,
      );
    });
  });

  describe('getAllBalances', () => {
    it('should call getAllBalances', async () => {
      const query = { page: '1' };
      const result = await controller.getAllBalances(query);
      expect(result).toEqual({ data: [] });
      expect(mockLeaveBalanceService.getAllBalances).toHaveBeenCalledWith(
        query,
      );
    });
  });

  describe('adjustBalance', () => {
    it('should call manualAdjustment on LeaveEngineService', async () => {
      const hrUser = { id: 'hr-123' };
      const dto = {
        employeeId: 'emp-123',
        leaveTypeId: 'type-123',
        days: 5,
        remarks: 'Bonus leave credit',
      };

      const result = await controller.adjustBalance(hrUser, dto);
      expect(result).toEqual({ id: 'ledger-123' });
      expect(mockLeaveEngineService.manualAdjustment).toHaveBeenCalledWith(
        'emp-123',
        'type-123',
        5,
        'Bonus leave credit',
        'hr-123',
      );
    });
  });
});
