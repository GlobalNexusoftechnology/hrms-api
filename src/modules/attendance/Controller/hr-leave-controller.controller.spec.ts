import { Test, TestingModule } from '@nestjs/testing';
import { HrLeaveController } from './hr-leave-controller.controller';
import { LeaveService } from '../Service/leave.service';
import { LeaveStatusEnum } from '../../../common/enums/leave-status.enum';

describe('HrLeaveController', () => {
  let controller: HrLeaveController;
  let service: LeaveService;

  const mockLeaveService = {
    findAll: jest.fn().mockResolvedValue([]),
    reviewLeave: jest.fn().mockResolvedValue({ message: 'Reviewed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrLeaveController],
      providers: [
        {
          provide: LeaveService,
          useValue: mockLeaveService,
        },
      ],
    }).compile();

    controller = module.get<HrLeaveController>(HrLeaveController);
    service = module.get<LeaveService>(LeaveService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call leaveService.findAll', async () => {
      const query = { page: '1' };
      const result = await controller.findAll(query);
      expect(result).toEqual([]);
      expect(mockLeaveService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('approve', () => {
    it('should call leaveService.reviewLeave with APPROVED', async () => {
      const user = { id: 'hr-123' };
      const result = await controller.approve('leave-123', user, 'Approved');
      expect(result).toEqual({ message: 'Reviewed' });
      expect(mockLeaveService.reviewLeave).toHaveBeenCalledWith(
        'leave-123',
        LeaveStatusEnum.APPROVED,
        'hr-123',
        'Approved',
      );
    });
  });

  describe('reject', () => {
    it('should call leaveService.reviewLeave with REJECTED', async () => {
      const user = { id: 'hr-123' };
      const result = await controller.reject('leave-123', user, 'Rejected');
      expect(result).toEqual({ message: 'Reviewed' });
      expect(mockLeaveService.reviewLeave).toHaveBeenCalledWith(
        'leave-123',
        LeaveStatusEnum.REJECTED,
        'hr-123',
        'Rejected',
      );
    });
  });
});
