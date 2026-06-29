import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { Role } from '../roles/entities/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

// Mock fs to avoid touching disk during tests
jest.mock('fs', () => ({
  renameSync: jest.fn(),
}));

// Mock bcrypt to avoid hashing latency and redefinition errors
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock canvas and qrcode to prevent dependencies on native binaries during unit tests
jest.mock('canvas', () => ({
  createCanvas: jest.fn().mockReturnValue({
    getContext: jest.fn().mockReturnValue({
      fillRect: jest.fn(),
      fillText: jest.fn(),
      drawImage: jest.fn(),
      fillStyle: '',
      font: '',
    }),
    createPNGStream: jest.fn().mockReturnValue({
      pipe: jest.fn((res) => res),
    }),
  }),
  loadImage: jest.fn().mockResolvedValue({}),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqr'),
}));

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: any;
  let departmentRepository: any;
  let designationRepository: any;
  let roleRepository: any;
  let refreshTokenRepository: any;

  const mockEmployee = {
    id: 'emp-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobile: '1234567890',
    currentAddress: '123 Main St',
    password: 'hashedpassword',
    roleId: 'role-id',
    departmentId: 'dept-id',
    designationId: 'desg-id',
    joiningDate: new Date('2026-06-29'),
    employmentType: 'Full-time',
    gender: 'Male',
    dateOfBirth: '1995-01-01',
    employeeCode: 'EMP-001',
    isActive: true,
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Department),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Designation),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepository = module.get(getRepositoryToken(Employee));
    departmentRepository = module.get(getRepositoryToken(Department));
    designationRepository = module.get(getRepositoryToken(Designation));
    roleRepository = module.get(getRepositoryToken(Role));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmployeeCode', () => {
    it('should generate EMP-001 if no employee exists', async () => {
      employeeRepository.find.mockResolvedValue([]);
      const code = await service.generateEmployeeCode();
      expect(code).toBe('EMP-001');
    });

    it('should increment code based on last employee code', async () => {
      employeeRepository.find.mockResolvedValue([{ employeeCode: 'EMP-005' }]);
      const code = await service.generateEmployeeCode();
      expect(code).toBe('EMP-006');
    });
  });

  describe('create', () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '1234567890',
      currentAddress: '123 Main St',
      password: 'password123',
      roleId: 'role-id',
      departmentId: 'dept-id',
      designationId: 'desg-id',
      joiningDate: new Date('2026-06-29'),
      employmentType: 'Full-time',
      gender: 'Male',
      dateOfBirth: '1995-01-01',
    };

    beforeEach(() => {
      employeeRepository.findOne.mockResolvedValue(null);
      roleRepository.findOne.mockResolvedValue({
        id: 'role-id',
        isActive: true,
      });
      departmentRepository.findOne.mockResolvedValue({
        id: 'dept-id',
        isActive: true,
      });
      designationRepository.findOne.mockResolvedValue({
        id: 'desg-id',
        departmentId: 'dept-id',
        isActive: true,
      });
      employeeRepository.find.mockResolvedValue([]);
      employeeRepository.create.mockReturnValue(mockEmployee);
      employeeRepository.save.mockResolvedValue(mockEmployee);
    });

    it('should successfully create employee and return full object', async () => {
      // Mock findOne for final retrieval
      employeeRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null) // mobile check
        .mockResolvedValueOnce(mockEmployee); // final retrieve

      const result = await service.create(createDto as any);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw ConflictException if email exists', async () => {
      employeeRepository.findOne.mockResolvedValueOnce({ id: 'other' });

      await expect(service.create(createDto as any)).rejects.toThrow(
        new ConflictException(`Email 'john.doe@example.com' already exists`),
      );
    });

    it('should throw ConflictException if mobile exists', async () => {
      employeeRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 'other' }); // mobile check

      await expect(service.create(createDto as any)).rejects.toThrow(
        new ConflictException(`Mobile '1234567890' already exists`),
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        new NotFoundException('Role not found'),
      );
    });

    it('should throw BadRequestException if designation without department', async () => {
      const invalidDto = { ...createDto, departmentId: undefined };
      await expect(service.create(invalidDto as any)).rejects.toThrow(
        new BadRequestException(
          'Department is required when designation is selected',
        ),
      );
    });

    it('should throw NotFoundException if department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        new NotFoundException('Department not found'),
      );
    });

    it('should throw NotFoundException if designation not found', async () => {
      designationRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        new NotFoundException('Designation not found'),
      );
    });

    it('should throw BadRequestException if designation belongs to a different department', async () => {
      designationRepository.findOne.mockResolvedValue({
        id: 'desg-id',
        departmentId: 'other-dept-id',
        isActive: true,
      });

      await expect(service.create(createDto as any)).rejects.toThrow(
        new BadRequestException(
          'Designation does not belong to selected department',
        ),
      );
    });

    it('should handle unique database constraint codes 23505 (e.g., email)', async () => {
      employeeRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (email)=(john.doe@example.com) already exists.',
      });

      await expect(service.create(createDto as any)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
    });
  });

  describe('findByIdentifier', () => {
    it('should return employee by email or code', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      const result = await service.findByIdentifier('john.doe@example.com');
      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return employee by ID', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      const result = await service.findById('emp-123');
      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return employee if found', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      const result = await service.findOne('emp-123');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException if not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(
        new NotFoundException('Employee not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should build query and return data with meta metrics', async () => {
      const mockQueryBuilder = {
        distinct: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockEmployee], 1]),
      };

      employeeRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const queryDto = {
        page: '1',
        limit: '10',
        search: 'John',
        roleId: 'role-id',
        departmentId: 'dept-id',
        designationId: 'desg-id',
        gender: 'Male',
        employmentType: 'Full-time',
        isActive: 'true',
      };

      const result = await service.findAll(queryDto as any);

      expect(result.data).toEqual([mockEmployee]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(employeeRepository.createQueryBuilder).toHaveBeenCalledWith(
        'employee',
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'John Updated',
      email: 'john.new@example.com',
      mobile: '9876543210',
      password: 'newpassword',
      isActive: false,
    };

    it('should successfully update employee and revoke refresh tokens on deactivate', async () => {
      const existingEmployee = { ...mockEmployee };
      const updatedEmployee = { ...mockEmployee, ...updateDto };

      employeeRepository.findOne
        .mockResolvedValueOnce(existingEmployee) // for existing employee check
        .mockResolvedValueOnce(null) // for email duplicate check
        .mockResolvedValueOnce(null) // for mobile duplicate check
        .mockResolvedValueOnce(updatedEmployee); // for final findOne call

      employeeRepository.save.mockResolvedValue(updatedEmployee);
      refreshTokenRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('emp-123', updateDto);

      expect(result.firstName).toBe('John Updated');
      expect(result.email).toBe('john.new@example.com');
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { employeeId: 'emp-123', isRevoked: false },
        { isRevoked: true },
      );
    });

    it('should throw ConflictException on email collision', async () => {
      employeeRepository.findOne
        .mockResolvedValueOnce(mockEmployee) // user exists
        .mockResolvedValueOnce({ id: 'another-user' }); // email exists on another user

      await expect(
        service.update('emp-123', { email: 'collision@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on mobile collision', async () => {
      employeeRepository.findOne
        .mockResolvedValueOnce(mockEmployee) // user exists
        .mockResolvedValueOnce({ id: 'another-user' }); // mobile exists on another user

      await expect(
        service.update('emp-123', { mobile: '9999999999' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should throw BadRequestException if file is missing', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      await expect(
        service.uploadProfilePhoto('emp-123', null as any),
      ).rejects.toThrow(new BadRequestException('Photo is required'));
    });

    it('should move file and update profile path on successful upload', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const mockFile = {
        originalname: 'photo.jpg',
        path: 'uploads/temp/photo.jpg',
      } as Express.Multer.File;

      const result = await service.uploadProfilePhoto('emp-123', mockFile);

      expect(fs.renameSync).toHaveBeenCalled();
      expect(result.profilePhoto).toContain('_profile_');
      expect(employeeRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete employee successfully', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('emp-123');

      expect(result).toEqual({ message: 'Employee deleted successfully' });
      expect(employeeRepository.softDelete).toHaveBeenCalledWith('emp-123');
    });

    it('should throw NotFoundException if user to remove does not exist', async () => {
      employeeRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted employee', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore('emp-123');

      expect(result).toEqual({ message: 'Employee restored successfully' });
      expect(employeeRepository.restore).toHaveBeenCalledWith('emp-123');
    });

    it('should throw NotFoundException if user to restore does not exist', async () => {
      employeeRepository.findOne.mockResolvedValue(null);
      await expect(service.restore('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should trigger database update with new timestamp', async () => {
      employeeRepository.update.mockResolvedValue({ affected: 1 });
      await service.updateLastLogin('emp-123');
      expect(employeeRepository.update).toHaveBeenCalledWith(
        'emp-123',
        expect.any(Object),
      );
    });
  });

  describe('generateIdCard', () => {
    it('should stream PNG stream data to response object', async () => {
      const mockFullEmployee = {
        ...mockEmployee,
        department: { name: 'Engineering' },
        designation: { name: 'Engineer' },
        profilePhoto: 'uploads/profiles/emp_photo.jpg',
      };
      employeeRepository.findOne.mockResolvedValue(mockFullEmployee);

      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      await service.generateIdCard('emp-123', mockResponse);

      expect(employeeRepository.findOne).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/png',
      );
    });

    it('should throw NotFoundException if employee is not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);
      const mockResponse = {} as any;

      await expect(
        service.generateIdCard('invalid', mockResponse),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
