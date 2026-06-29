import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { GetEmployeesDto } from './dto/get-employees.dto';
import { Response } from 'express';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployee = {
    id: 'emp-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobile: '1234567890',
  };

  const mockEmployeesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    generateIdCard: jest.fn(),
    update: jest.fn(),
    uploadProfilePhoto: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and return employee', async () => {
      const dto: CreateEmployeeDto = {
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
      } as any;

      mockEmployeesService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(dto);

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query and return pagination object', async () => {
      const query: GetEmployeesDto = {
        page: '1',
        limit: '10',
      };

      const mockResponse = { data: [mockEmployee], meta: {} };
      mockEmployeesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and return employee', async () => {
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne('emp-123');

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeesService.findOne).toHaveBeenCalledWith('emp-123');
    });
  });

  describe('generateIdCard', () => {
    it('should call service.generateIdCard with id and response object', async () => {
      const mockResponse = {} as Response;
      mockEmployeesService.generateIdCard.mockResolvedValue(undefined);

      await controller.generateIdCard('emp-123', mockResponse);

      expect(mockEmployeesService.generateIdCard).toHaveBeenCalledWith(
        'emp-123',
        mockResponse,
      );
    });
  });

  describe('update', () => {
    it('should call service.update with id/dto and return updated employee', async () => {
      const dto: UpdateEmployeeDto = { firstName: 'Updated' };
      const mockUpdated = { ...mockEmployee, firstName: 'Updated' };
      mockEmployeesService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('emp-123', dto);

      expect(result).toEqual(mockUpdated);
      expect(mockEmployeesService.update).toHaveBeenCalledWith('emp-123', dto);
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should call service.uploadProfilePhoto with id/file and return upload details', async () => {
      const mockFile = {} as Express.Multer.File;
      const mockUploadResponse = { message: 'success', profilePhoto: 'path' };
      mockEmployeesService.uploadProfilePhoto.mockResolvedValue(
        mockUploadResponse,
      );

      const result = await controller.uploadProfilePhoto('emp-123', mockFile);

      expect(result).toEqual(mockUploadResponse);
      expect(mockEmployeesService.uploadProfilePhoto).toHaveBeenCalledWith(
        'emp-123',
        mockFile,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and return deletion message', async () => {
      const mockMsg = { message: 'Employee deleted successfully' };
      mockEmployeesService.remove.mockResolvedValue(mockMsg);

      const result = await controller.remove('emp-123');

      expect(result).toEqual(mockMsg);
      expect(mockEmployeesService.remove).toHaveBeenCalledWith('emp-123');
    });
  });

  describe('restore', () => {
    it('should call service.restore with id and return success message', async () => {
      const mockMsg = { message: 'Employee restored successfully' };
      mockEmployeesService.restore.mockResolvedValue(mockMsg);

      const result = await controller.restore('emp-123');

      expect(result).toEqual(mockMsg);
      expect(mockEmployeesService.restore).toHaveBeenCalledWith('emp-123');
    });
  });
});
