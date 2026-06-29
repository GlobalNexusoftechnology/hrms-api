import { Test, TestingModule } from '@nestjs/testing';
import { HrAttendanceController } from './hr-attendance.controller';
import { AttendanceQueryService } from '../Service/attendance-query.service';
import { AttendanceDashboardService } from '../Service/attendance-dashboard.service';
import { CorrectionService } from '../Service/correction.service';
import { CorrectionStatus } from '../../../common/enums/CorrectionStatus.enum';

describe('HrAttendanceController', () => {
  let controller: HrAttendanceController;

  const mockAttendanceQueryService = {
    getFilteredAttendance: jest.fn().mockResolvedValue([]),
    getTodayAttendance: jest.fn().mockResolvedValue([]),
  };
  const mockAttendanceDashboardService = {
    getHrDashboard: jest.fn().mockResolvedValue({}),
  };
  const mockCorrectionService = {
    review: jest.fn().mockResolvedValue({ message: 'Reviewed' }),
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrAttendanceController],
      providers: [
        {
          provide: AttendanceQueryService,
          useValue: mockAttendanceQueryService,
        },
        {
          provide: AttendanceDashboardService,
          useValue: mockAttendanceDashboardService,
        },
        { provide: CorrectionService, useValue: mockCorrectionService },
      ],
    }).compile();

    controller = module.get<HrAttendanceController>(HrAttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should query filtered records', async () => {
      const query = { page: '1' };
      const result = await controller.getAll(query);
      expect(result).toEqual([]);
      expect(
        mockAttendanceQueryService.getFilteredAttendance,
      ).toHaveBeenCalledWith(query);
    });
  });

  describe('approve', () => {
    it('should call correctionService.review with APPROVED status', async () => {
      const user = { id: 'hr-123' };
      const result = await controller.approve('corr-123', user);
      expect(result).toEqual({ message: 'Reviewed' });
      expect(mockCorrectionService.review).toHaveBeenCalledWith(
        'corr-123',
        CorrectionStatus.APPROVED,
        'hr-123',
      );
    });
  });

  describe('reject', () => {
    it('should call correctionService.review with REJECTED status', async () => {
      const user = { id: 'hr-123' };
      const result = await controller.reject('corr-123', user);
      expect(result).toEqual({ message: 'Reviewed' });
      expect(mockCorrectionService.review).toHaveBeenCalledWith(
        'corr-123',
        CorrectionStatus.REJECTED,
        'hr-123',
      );
    });
  });

  describe('getCorrections', () => {
    it('should fetch all corrections', async () => {
      const query = { page: '1' };
      const result = await controller.getCorrections(query);
      expect(result).toEqual([]);
      expect(mockCorrectionService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getDashboard', () => {
    it('should fetch dashboard', async () => {
      const result = await controller.getDashboard();
      expect(result).toEqual({});
      expect(mockAttendanceDashboardService.getHrDashboard).toHaveBeenCalled();
    });
  });

  describe('getTodayAttendance', () => {
    it('should fetch today attendance', async () => {
      const query = { page: '1' };
      const result = await controller.getTodayAttendance(query);
      expect(result).toEqual([]);
      expect(
        mockAttendanceQueryService.getTodayAttendance,
      ).toHaveBeenCalledWith(query);
    });
  });
});
