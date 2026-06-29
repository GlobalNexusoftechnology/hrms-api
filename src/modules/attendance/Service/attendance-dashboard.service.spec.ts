import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceDashboardService } from './attendance-dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Leave } from '../entities/leave.entity';
import { Department } from '../../departments/entities/department.entity';

describe('AttendanceDashboardService', () => {
  let service: AttendanceDashboardService;

  const mockRepository = () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceDashboardService,
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<AttendanceDashboardService>(
      AttendanceDashboardService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
