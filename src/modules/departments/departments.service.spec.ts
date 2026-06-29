import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repository: any;
  let localDepartment: any;

  const mockDepartmentTemplate = {
    id: 'dept-123',
    name: 'Human Resources',
    code: 'HR',
    isActive: true,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    localDepartment = { ...mockDepartmentTemplate };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    repository = module.get(getRepositoryToken(Department));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { name: 'Human Resources', code: 'HR' };

    it('should successfully create department', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(localDepartment);
      repository.save.mockResolvedValue(localDepartment);

      const result = await service.create(createDto);
      expect(result).toEqual(localDepartment);
    });

    it('should throw ConflictException if name exists', async () => {
      repository.findOne.mockResolvedValueOnce({ id: 'other-id' });
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if code exists', async () => {
      repository.findOne
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce({ id: 'other-id' }); // code check

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should build query and return data with meta', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[localDepartment], 1]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10, 'HR');
      expect(result.data).toEqual([localDepartment]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return department if found', async () => {
      repository.findOne.mockResolvedValue(localDepartment);
      const result = await service.findOne('dept-123');
      expect(result).toEqual(localDepartment);
    });

    it('should throw NotFoundException if department not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update department', async () => {
      repository.findOne
        .mockResolvedValueOnce(localDepartment) // for findOne inside update
        .mockResolvedValueOnce(null) // name conflict check
        .mockResolvedValueOnce(null); // code conflict check

      repository.save.mockResolvedValue({
        ...localDepartment,
        name: 'HR Updated',
      });

      const result = await service.update('dept-123', { name: 'HR Updated' });
      expect(result.name).toBe('HR Updated');
    });

    it('should throw ConflictException if updated name belongs to other department', async () => {
      repository.findOne
        .mockResolvedValueOnce(localDepartment) // for findOne inside update
        .mockResolvedValueOnce({ id: 'other-id', name: 'HR Updated' }); // name conflict check finds another user

      await expect(
        service.update('dept-123', { name: 'HR Updated' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete department', async () => {
      repository.findOne.mockResolvedValue(localDepartment);
      repository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('dept-123');
      expect(result).toEqual({ message: 'Department deleted successfully' });
      expect(repository.softDelete).toHaveBeenCalledWith('dept-123');
    });
  });

  describe('restore', () => {
    it('should restore department', async () => {
      repository.findOne.mockResolvedValue(localDepartment);
      repository.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore('dept-123');
      expect(result).toEqual({ message: 'Department restored successfully' });
      expect(repository.restore).toHaveBeenCalledWith('dept-123');
    });

    it('should throw NotFoundException if department to restore does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.restore('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
