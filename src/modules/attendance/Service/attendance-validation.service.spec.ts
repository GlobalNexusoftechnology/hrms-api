import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceValidationService } from './attendance-validation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Holiday } from '../../holiday/entities/holiday.entity';
import { WeekendSetting } from '../../weekend_settings/entities/weekend_setting.entity';
import { Leave } from '../entities/leave.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AttendanceValidationService', () => {
  let service: AttendanceValidationService;
  let employeeRepo: any;
  let holidayRepo: any;
  let weekendRepo: any;
  let leaveRepo: any;

  const mockRepository = () => ({
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceValidationService,
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Holiday), useFactory: mockRepository },
        {
          provide: getRepositoryToken(WeekendSetting),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<AttendanceValidationService>(
      AttendanceValidationService,
    );
    employeeRepo = module.get(getRepositoryToken(Employee));
    holidayRepo = module.get(getRepositoryToken(Holiday));
    weekendRepo = module.get(getRepositoryToken(WeekendSetting));
    leaveRepo = module.get(getRepositoryToken(Leave));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateEmployee', () => {
    it('should return employee if active and exists', async () => {
      employeeRepo.findOne.mockResolvedValue({ id: 'emp-123', isActive: true });
      const result = await service.validateEmployee('emp-123');
      expect(result.id).toBe('emp-123');
    });

    it('should throw NotFoundException if employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.validateEmployee('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateCheckIn', () => {
    it('should throw BadRequestException if already checked in', () => {
      expect(() =>
        service.validateCheckIn({ checkIn: new Date() } as any),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if today is leave/weekend/holiday', () => {
      expect(() => service.validateCheckIn({ status: 'LEAVE' } as any)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateCheckOut', () => {
    it('should throw BadRequestException if check-in not found', () => {
      expect(() => service.validateCheckOut(null)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already checked out', () => {
      expect(() =>
        service.validateCheckOut({
          checkIn: new Date(),
          checkOut: new Date(),
        } as any),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateEarlyCheckout', () => {
    it('should throw BadRequestException if early checkout and no reason provided', () => {
      expect(() => service.validateEarlyCheckout(300, undefined)).toThrow(
        BadRequestException,
      );
    });

    it('should return isEarly true if reason provided', () => {
      const result = service.validateEarlyCheckout(300, 'Doctor appointment');
      expect(result.isEarly).toBe(true);
      expect(result.reason).toBe('Doctor appointment');
    });
  });
});
