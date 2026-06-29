import { Test, TestingModule } from '@nestjs/testing';
import { InterviewService } from './interview.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { Interview } from './entities/interview.entity';
import { InterviewFeedback } from './entities/interview-feedback.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { EmployeesService } from '../employees/employees.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CandidateStatusEnum } from '../../common/enums/candidate-status.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('InterviewService', () => {
  let service: InterviewService;
  let candidateRepo: any;
  let employeeRepo: any;
  let roleRepo: any;
  let departmentRepo: any;
  let designationRepo: any;
  let employeeService: any;

  const mockCandidate = {
    id: 'cand-123',
    firstName: 'Candidate',
    lastName: 'One',
    email: 'cand@example.com',
    mobile: '9999999999',
    status: CandidateStatusEnum.SELECTED,
  };

  const mockEmployee = {
    id: 'emp-123',
    employeeCode: 'EMP-001',
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exists: jest.fn().mockResolvedValue(false),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        { provide: getRepositoryToken(Candidate), useFactory: mockRepository },
        { provide: getRepositoryToken(Interview), useFactory: mockRepository },
        {
          provide: getRepositoryToken(InterviewFeedback),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Role), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
        {
          provide: getRepositoryToken(Designation),
          useFactory: mockRepository,
        },
        {
          provide: EmployeesService,
          useValue: {
            generateEmployeeCode: jest.fn().mockResolvedValue('EMP-002'),
          },
        },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    candidateRepo = module.get(getRepositoryToken(Candidate));
    employeeRepo = module.get(getRepositoryToken(Employee));
    roleRepo = module.get(getRepositoryToken(Role));
    departmentRepo = module.get(getRepositoryToken(Department));
    designationRepo = module.get(getRepositoryToken(Designation));
    employeeService = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCandidate', () => {
    const createDto = {
      email: 'cand@example.com',
      mobile: '9999999999',
      firstName: 'Cand',
      lastName: 'One',
    };

    it('should successfully create candidate if no conflicts', async () => {
      candidateRepo.findOne.mockResolvedValue(null);
      employeeRepo.exists.mockResolvedValue(false);
      candidateRepo.create.mockReturnValue(mockCandidate);
      candidateRepo.save.mockResolvedValue(mockCandidate);

      const result = await service.createCandidate(createDto);
      expect(result).toEqual(mockCandidate);
    });

    it('should throw BadRequestException if candidate email already exists', async () => {
      candidateRepo.findOne.mockResolvedValue(mockCandidate);
      await expect(service.createCandidate(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('convertToEmployee', () => {
    const convertDto = {
      roleId: 'role-123',
      departmentId: 'dept-123',
      designationId: 'desg-123',
      joiningDate: new Date('2026-06-30'),
      employmentType: 'Full-time',
    };

    it('should hire candidate and create employee record', async () => {
      candidateRepo.findOne.mockResolvedValue(mockCandidate);
      employeeRepo.findOne.mockResolvedValue(null); // email and mobile check fine
      roleRepo.findOne.mockResolvedValue({ id: 'role-123' });
      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      designationRepo.findOne.mockResolvedValue({ id: 'desg-123' });
      employeeRepo.create.mockReturnValue(mockEmployee);
      employeeRepo.save.mockResolvedValue(mockEmployee);
      candidateRepo.save.mockResolvedValue(mockCandidate);

      const result = await service.convertToEmployee(
        'cand-123',
        convertDto as any,
      );
      expect(result.success).toBe(true);
      expect(result.employee).toEqual(mockEmployee);
    });

    it('should throw BadRequestException if candidate is not selected status', async () => {
      const nonSelectedCand = {
        ...mockCandidate,
        status: CandidateStatusEnum.APPLIED,
      };
      candidateRepo.findOne.mockResolvedValue(nonSelectedCand);

      await expect(
        service.convertToEmployee('cand-123', convertDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
