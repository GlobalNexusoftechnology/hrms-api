import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { DataSource } from 'typeorm';
import { AttendanceValidationService } from './attendance-validation.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let validationService: any;
  let mockEntityManager: any;

  const mockAttendance = {
    id: 'att-123',
    employeeId: 'emp-123',
    date: '2026-06-29',
    checkIn: new Date('2026-06-29T09:00:00Z'),
    checkOut: null,
    workedMinutes: 0,
    status: 'PRESENT',
  };

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue(mockAttendance),
      save: jest.fn().mockResolvedValue(mockAttendance),
    };

    const mockDataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
    };

    const mockValidationService = {
      validateEmployee: jest.fn().mockResolvedValue(undefined),
      validateWorkingDay: jest.fn().mockResolvedValue(undefined),
      validateCheckIn: jest.fn().mockResolvedValue(undefined),
      validateCheckOut: jest.fn().mockResolvedValue(undefined),
      validateEarlyCheckout: jest
        .fn()
        .mockReturnValue({ reason: null, message: 'Success' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: AttendanceValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    validationService = module.get<AttendanceValidationService>(
      AttendanceValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIn', () => {
    it('should perform validation, create/save attendance within a transaction', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce(null) // first findOne inside checkIn
        .mockResolvedValueOnce(mockAttendance); // second findOne relations retrieve

      const result = await service.checkIn('emp-123', 'Office');

      expect(validationService.validateEmployee).toHaveBeenCalledWith(
        'emp-123',
      );
      expect(validationService.validateWorkingDay).toHaveBeenCalledWith(
        'emp-123',
      );
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('checkOut', () => {
    it('should update attendance checkout details and calculate worked hours', async () => {
      const activeAttendance = {
        ...mockAttendance,
        checkIn: new Date(Date.now() - 5 * 60 * 60 * 1000),
      }; // 5 hours ago
      mockEntityManager.findOne
        .mockResolvedValueOnce(activeAttendance) // first findOne
        .mockResolvedValueOnce(activeAttendance); // second findOne

      const result = await service.checkOut('emp-123', 'Office', 'Done');

      expect(validationService.validateCheckOut).toHaveBeenCalled();
      expect(result.workedHours).toBeCloseTo(5);
      expect(mockEntityManager.save).toHaveBeenCalled();
    });
  });
});
