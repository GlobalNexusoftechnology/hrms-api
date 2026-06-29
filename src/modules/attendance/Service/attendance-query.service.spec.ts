import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceQueryService } from './attendance-query.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Employee } from '../../employees/entities/employee.entity';

describe('AttendanceQueryService', () => {
  let service: AttendanceQueryService;

  const mockRepository = () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceQueryService,
        {
          provide: getRepositoryToken(Attendance),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AttendanceQueryService>(AttendanceQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
