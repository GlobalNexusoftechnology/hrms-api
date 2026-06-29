import { Test, TestingModule } from '@nestjs/testing';
import { DesignationsService } from './designations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Designation } from './entities/designation.entity';
import { Department } from '../departments/entities/department.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DesignationsService', () => {
  let service: DesignationsService;
  let designationRepo: any;
  let departmentRepo: any;
  let localDesignation: any;

  const mockDesignationTemplate = {
    id: 'desg-123',
    name: 'Software Engineer',
    code: 'SE',
    departmentId: 'dept-123',
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
    localDesignation = { ...mockDesignationTemplate };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignationsService,
        {
          provide: getRepositoryToken(Designation),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<DesignationsService>(DesignationsService);
    designationRepo = module.get(getRepositoryToken(Designation));
    departmentRepo = module.get(getRepositoryToken(Department));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Software Engineer',
      code: 'SE',
      departmentId: 'dept-123',
    };

    it('should successfully create designation if department exists', async () => {
      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      designationRepo.findOne.mockResolvedValue(null);
      designationRepo.create.mockReturnValue(localDesignation);
      designationRepo.save.mockResolvedValue(localDesignation);

      const result = await service.create(createDto);
      expect(result).toEqual(localDesignation);
    });

    it('should throw NotFoundException if department not found', async () => {
      departmentRepo.findOne.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if designation name exists', async () => {
      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      designationRepo.findOne.mockResolvedValueOnce({
        id: 'other-id',
        name: 'Software Engineer',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should build query and return data with meta', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[localDesignation], 1]),
      };
      designationRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10, 'SE', 'dept-123');
      expect(result.data).toEqual([localDesignation]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return designation if found', async () => {
      designationRepo.findOne.mockResolvedValue(localDesignation);
      const result = await service.findOne('desg-123');
      expect(result).toEqual(localDesignation);
    });

    it('should throw NotFoundException if designation not found', async () => {
      designationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update designation', async () => {
      designationRepo.findOne
        .mockResolvedValueOnce(localDesignation) // inside findOne
        .mockResolvedValueOnce(null) // name collision check
        .mockResolvedValueOnce(null); // code collision check

      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      designationRepo.save.mockResolvedValue({
        ...localDesignation,
        name: 'SE Updated',
      });

      const result = await service.update('desg-123', {
        name: 'SE Updated',
        departmentId: 'dept-123',
      });
      expect(result.name).toBe('SE Updated');
    });

    it('should throw ConflictException if updated name belongs to other designation', async () => {
      designationRepo.findOne
        .mockResolvedValueOnce(localDesignation) // inside findOne
        .mockResolvedValueOnce({ id: 'other-id', name: 'SE Updated' }); // name collision check finds other

      await expect(
        service.update('desg-123', { name: 'SE Updated' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete designation', async () => {
      designationRepo.findOne.mockResolvedValue(localDesignation);
      designationRepo.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('desg-123');
      expect(result).toEqual({ message: 'Designation deleted successfully' });
      expect(designationRepo.softDelete).toHaveBeenCalledWith('desg-123');
    });
  });

  describe('restore', () => {
    it('should restore designation', async () => {
      designationRepo.findOne
        .mockResolvedValueOnce(localDesignation) // findOne withDeleted
        .mockResolvedValueOnce(null) // name collision check
        .mockResolvedValueOnce(null); // code collision check

      designationRepo.restore.mockResolvedValue({ affected: 1 });

      const result = await service.restore('desg-123');
      expect(result).toEqual({ message: 'Designation restored successfully' });
      expect(designationRepo.restore).toHaveBeenCalledWith('desg-123');
    });
  });
});
