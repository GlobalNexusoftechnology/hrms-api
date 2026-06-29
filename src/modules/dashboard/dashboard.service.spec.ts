import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Leave } from '../attendance/entities/leave.entity';
import { Candidate } from '../interview/entities/candidate.entity';
import { Training } from '../training/entities/training.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let employeeRepo: any;
  let departmentRepo: any;
  let attendanceRepo: any;
  let leaveRepo: any;
  let candidateRepo: any;
  let trainingRepo: any;

  const mockRepository = () => ({
    count: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        { provide: getRepositoryToken(Leave), useFactory: mockRepository },
        { provide: getRepositoryToken(Candidate), useFactory: mockRepository },
        { provide: getRepositoryToken(Training), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    departmentRepo = module.get(getRepositoryToken(Department));
    attendanceRepo = module.get(getRepositoryToken(Attendance));
    leaveRepo = module.get(getRepositoryToken(Leave));
    candidateRepo = module.get(getRepositoryToken(Candidate));
    trainingRepo = module.get(getRepositoryToken(Training));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuperAdminDashboard', () => {
    it('should aggregate counts and metrics and return dashboard object', async () => {
      employeeRepo.count.mockResolvedValue(10);
      departmentRepo.count.mockResolvedValue(3);
      candidateRepo.count.mockResolvedValue(5);
      trainingRepo.count.mockResolvedValue(2);
      leaveRepo.count.mockResolvedValue(4);
      attendanceRepo.find.mockResolvedValue([]);

      const result = await service.getSuperAdminDashboard();

      expect(result).toHaveProperty('employees');
      expect(result).toHaveProperty('recruitment');
      expect(result).toHaveProperty('attendance');
      expect(result).toHaveProperty('leaves');
      expect(employeeRepo.count).toHaveBeenCalled();
    });
  });

  describe('getHrDashboard', () => {
    it('should return recruitment, attendance, and leave statistics', async () => {
      employeeRepo.count.mockResolvedValue(10);
      candidateRepo.count.mockResolvedValue(3);
      attendanceRepo.find.mockResolvedValue([]);
      departmentRepo.find.mockResolvedValue([]);

      const result = await service.getHrDashboard();

      expect(result).toHaveProperty('recruitment');
      expect(result).toHaveProperty('attendance');
      expect(result).toHaveProperty('leaves');
    });
  });

  describe('getEmployeeDashboard', () => {
    const mockEmployeeData = {
      id: 'emp-123',
      firstName: 'John',
      lastName: 'Doe',
      employeeCode: 'EMP-001',
      isActive: true,
      department: { name: 'IT' },
      designation: { name: 'Engineer' },
    };

    it('should return employee dashboard metrics if employee found', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployeeData);
      attendanceRepo.findOne.mockResolvedValue(null);
      attendanceRepo.find.mockResolvedValue([]);
      leaveRepo.find.mockResolvedValue([]);
      leaveRepo.count.mockResolvedValue(0);

      const result = await service.getEmployeeDashboard('emp-123');

      expect(result).not.toBeNull();
      expect(result!.employee.name).toBe('John Doe');
      expect(result!.attendance.today).toBeNull();
    });

    it('should return null if employee is not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      const result = await service.getEmployeeDashboard('invalid-id');
      expect(result).toBeNull();
    });
  });
});
