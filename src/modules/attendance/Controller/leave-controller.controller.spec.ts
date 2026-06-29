import { Test, TestingModule } from '@nestjs/testing';
import { LeaveController } from './leave-controller.controller';
import { LeaveService } from '../Service/leave.service';
import { CreateLeaveDto } from '../dto/create-leave.dto';

describe('LeaveController', () => {
  let controller: LeaveController;
  let service: LeaveService;

  const mockLeaveService = {
    requestLeave: jest.fn().mockResolvedValue({ status: 'requested' }),
    getMyLeaves: jest.fn().mockResolvedValue([]),
    cancelLeave: jest.fn().mockResolvedValue({ status: 'cancelled' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveController],
      providers: [
        {
          provide: LeaveService,
          useValue: mockLeaveService,
        },
      ],
    }).compile();

    controller = module.get<LeaveController>(LeaveController);
    service = module.get<LeaveService>(LeaveService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestLeave', () => {
    it('should call leaveService.requestLeave', async () => {
      const user = { id: 'emp-123' };
      const dto: CreateLeaveDto = {
        startDate: '2026-06-30',
        endDate: '2026-07-02',
        type: 'Sick',
        reason: 'flu',
      } as any;
      const result = await controller.requestLeave(user, dto);
      expect(result).toEqual({ status: 'requested' });
      expect(mockLeaveService.requestLeave).toHaveBeenCalledWith(
        'emp-123',
        dto,
      );
    });
  });

  describe('getMyLeaves', () => {
    it('should call leaveService.getMyLeaves', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getMyLeaves(user, 'APPROVED');
      expect(result).toEqual([]);
      expect(mockLeaveService.getMyLeaves).toHaveBeenCalledWith(
        'emp-123',
        'APPROVED',
      );
    });
  });

  describe('cancelLeave', () => {
    it('should call leaveService.cancelLeave', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.cancelLeave('leave-123', user);
      expect(result).toEqual({ status: 'cancelled' });
      expect(mockLeaveService.cancelLeave).toHaveBeenCalledWith(
        'leave-123',
        'emp-123',
      );
    });
  });
});
