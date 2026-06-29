import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from '../Service/attendance.service';
import { AttendanceQueryService } from '../Service/attendance-query.service';
import { AttendanceDashboardService } from '../Service/attendance-dashboard.service';
import { CorrectionService } from '../Service/correction.service';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    checkIn: jest.fn().mockResolvedValue({ status: 'in' }),
    checkOut: jest.fn().mockResolvedValue({ status: 'out' }),
  };
  const mockAttendanceQueryService = {
    getMyAttendance: jest.fn().mockResolvedValue([]),
    getFilteredAttendance: jest.fn().mockResolvedValue([]),
    getTodayAttendance: jest.fn().mockResolvedValue([]),
    getAttendanceCalendar: jest.fn().mockResolvedValue([]),
  };
  const mockAttendanceDashboardService = {
    getEmployeeDashboard: jest.fn().mockResolvedValue({}),
  };
  const mockCorrectionService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: mockAttendanceService },
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

    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkIn', () => {
    it('should check in employee', async () => {
      const user = { id: 'emp-123' };
      const dto = { location: 'Office' };
      const result = await controller.checkIn(user, dto);
      expect(result).toEqual({ status: 'in' });
      expect(mockAttendanceService.checkIn).toHaveBeenCalledWith(
        'emp-123',
        'Office',
      );
    });
  });

  describe('checkOut', () => {
    it('should check out employee', async () => {
      const user = { id: 'emp-123' };
      const dto = { location: 'Office', earlyCheckoutReason: 'Done' };
      const result = await controller.checkOut(user, dto);
      expect(result).toEqual({ status: 'out' });
      expect(mockAttendanceService.checkOut).toHaveBeenCalledWith(
        'emp-123',
        'Office',
        'Done',
      );
    });
  });

  describe('getMyAttendance', () => {
    it('should fetch own attendance', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getMyAttendance(user);
      expect(result).toEqual([]);
      expect(mockAttendanceQueryService.getMyAttendance).toHaveBeenCalledWith(
        'emp-123',
      );
    });
  });

  describe('getFilteredAttendance', () => {
    it('should fetch filtered records', async () => {
      const query = { departmentId: 'dept-1' };
      const result = await controller.getFilteredAttendance(query);
      expect(result).toEqual([]);
      expect(
        mockAttendanceQueryService.getFilteredAttendance,
      ).toHaveBeenCalledWith(query);
    });
  });

  describe('getDashboard', () => {
    it('should fetch dashboard info', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getDashboard(user);
      expect(result).toEqual({});
      expect(
        mockAttendanceDashboardService.getEmployeeDashboard,
      ).toHaveBeenCalledWith('emp-123');
    });
  });

  describe('getTodayAttendance', () => {
    it('should fetch today attendance list', async () => {
      const query = { page: '1' };
      const result = await controller.getTodayAttendance(query);
      expect(result).toEqual([]);
      expect(
        mockAttendanceQueryService.getTodayAttendance,
      ).toHaveBeenCalledWith(query);
    });
  });

  describe('getAttendanceCalendar', () => {
    it('should fetch attendance calendar', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getAttendanceCalendar(user, 6, 2026);
      expect(result).toEqual([]);
      expect(
        mockAttendanceQueryService.getAttendanceCalendar,
      ).toHaveBeenCalledWith('emp-123', 6, 2026);
    });
  });
});
