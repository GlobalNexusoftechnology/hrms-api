import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getSuperAdminDashboard: jest.fn(),
    getHrDashboard: jest.fn(),
    getEmployeeDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return Super Admin dashboard if role is SUPER_ADMIN', async () => {
      const user = { id: 'emp-123', role: { name: 'SUPER_ADMIN' } };
      mockDashboardService.getSuperAdminDashboard.mockResolvedValue({
        stats: 'super',
      });

      const result = await controller.getDashboard(user);
      expect(result).toEqual({ stats: 'super' });
      expect(mockDashboardService.getSuperAdminDashboard).toHaveBeenCalled();
    });

    it('should return HR dashboard if role is HR', async () => {
      const user = { id: 'emp-123', role: { name: 'HR' } };
      mockDashboardService.getHrDashboard.mockResolvedValue({ stats: 'hr' });

      const result = await controller.getDashboard(user);
      expect(result).toEqual({ stats: 'hr' });
      expect(mockDashboardService.getHrDashboard).toHaveBeenCalled();
    });

    it('should return Employee dashboard if role is EMPLOYEE', async () => {
      const user = { id: 'emp-123', role: { name: 'EMPLOYEE' } };
      mockDashboardService.getEmployeeDashboard.mockResolvedValue({
        stats: 'employee',
      });

      const result = await controller.getDashboard(user);
      expect(result).toEqual({ stats: 'employee' });
      expect(mockDashboardService.getEmployeeDashboard).toHaveBeenCalledWith(
        'emp-123',
      );
    });

    it('should throw an error for invalid roles', async () => {
      const user = { id: 'emp-123', role: { name: 'INVALID' } };
      await expect(controller.getDashboard(user)).rejects.toThrow(
        'Invalid role',
      );
    });
  });

  describe('getMyDashboard', () => {
    it('should call getEmployeeDashboard with user.id', async () => {
      const user = { id: 'hr-123' };
      mockDashboardService.getEmployeeDashboard.mockResolvedValue({
        stats: 'personal',
      });
      const result = await controller.getMyDashboard(user);
      expect(result).toEqual({ stats: 'personal' });
      expect(mockDashboardService.getEmployeeDashboard).toHaveBeenCalledWith(
        'hr-123',
      );
    });
  });
});
