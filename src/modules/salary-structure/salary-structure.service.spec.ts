import { Test, TestingModule } from '@nestjs/testing';
import { SalaryStructureService } from './salary-structure.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalaryStructure } from './entities/salary-structure.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SalaryStructureService', () => {
  let service: SalaryStructureService;
  let salaryRepo: any;
  let employeeRepo: any;

  const mockEmployee = {
    id: 'emp-123',
    employeeCode: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockSalary = {
    id: 'sal-123',
    employeeId: 'emp-123',
    basicSalary: '50000',
    hra: '10000',
    allowance: '2000',
    bonus: '3000',
    pf: '4000',
    esic: '1000',
    professionalTax: '500',
    grossSalary: '65000',
    netSalary: '59500',
    effectiveFrom: new Date('2026-06-29'),
    isActive: true,
    employee: mockEmployee,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryStructureService,
        {
          provide: getRepositoryToken(SalaryStructure),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<SalaryStructureService>(SalaryStructureService);
    salaryRepo = module.get(getRepositoryToken(SalaryStructure));
    employeeRepo = module.get(getRepositoryToken(Employee));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      employeeId: 'emp-123',
      basicSalary: 50000,
      hra: 10000,
      allowance: 2000,
      bonus: 3000,
      pf: 4000,
      esic: 1000,
      professionalTax: 500,
    };

    it('should calculate gross and net salaries and save structure', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      salaryRepo.findOne.mockResolvedValue(null);
      salaryRepo.save.mockResolvedValue(mockSalary);
      salaryRepo.findOneOrFail.mockResolvedValue(mockSalary);
      
      const mockCurrentUser = { role: { name: 'SUPER_ADMIN' } };
      const result = await service.create(createDto as any, mockCurrentUser);
      expect(result.grossSalary).toBe(65000);
      expect(result.netSalary).toBe(59500);
      expect(salaryRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      const mockCurrentUser = { role: { name: 'SUPER_ADMIN' } };
      await expect(service.create(createDto as any, mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if active salary structure already exists', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      salaryRepo.findOne.mockResolvedValue(mockSalary);
      const mockCurrentUser = { role: { name: 'SUPER_ADMIN' } };

      await expect(service.create(createDto as any, mockCurrentUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMySalaryStructure', () => {
    it('should return parsed salary details if found', async () => {
      salaryRepo.findOne.mockResolvedValue(mockSalary);

      const result = await service.getMySalaryStructure('emp-123');
      expect(result.basicSalary).toBe(50000);
    });

    it('should throw NotFoundException if not found', async () => {
      salaryRepo.findOne.mockResolvedValue(null);
      await expect(service.getMySalaryStructure('emp-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
