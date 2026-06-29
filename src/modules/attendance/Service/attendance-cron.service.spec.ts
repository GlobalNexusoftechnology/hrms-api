import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceCronService } from './attendance-cron.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Holiday } from '../../holiday/entities/holiday.entity';
import { WeekendSetting } from '../../weekend_settings/entities/weekend_setting.entity';
import { Leave } from '../entities/leave.entity';
import { DataSource } from 'typeorm';

describe('AttendanceCronService', () => {
  let service: AttendanceCronService;

  const mockRepository = () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceCronService,
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Holiday), useFactory: mockRepository },
        {
          provide: getRepositoryToken(WeekendSetting),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<AttendanceCronService>(AttendanceCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
