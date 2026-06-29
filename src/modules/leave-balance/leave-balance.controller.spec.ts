import { Test, TestingModule } from '@nestjs/testing';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';

describe('LeaveBalanceController', () => {
  let controller: LeaveBalanceController;
  let service: LeaveBalanceService;

  const mockLeaveBalanceService = {
    getEmployeeBalance: jest.fn().mockResolvedValue({ remainingLeaves: 10 }),
    getAllBalances: jest.fn().mockResolvedValue({ data: [] }),
    creditMonthlyLeave: jest.fn().mockResolvedValue({ message: 'Success' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveBalanceController],
      providers: [
        {
          provide: LeaveBalanceService,
          useValue: mockLeaveBalanceService,
        },
      ],
    }).compile();

    controller = module.get<LeaveBalanceController>(LeaveBalanceController);
    service = module.get<LeaveBalanceService>(LeaveBalanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyBalance', () => {
    it('should call getEmployeeBalance', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getMyBalance(user);
      expect(result).toEqual({ remainingLeaves: 10 });
      expect(mockLeaveBalanceService.getEmployeeBalance).toHaveBeenCalledWith(
        'emp-123',
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

  describe('runMonthlyCredit', () => {
    it('should call creditMonthlyLeave', async () => {
      const result = await controller.runMonthlyCredit();
      expect(result).toEqual({ message: 'Success' });
      expect(mockLeaveBalanceService.creditMonthlyLeave).toHaveBeenCalled();
    });
  });
});
