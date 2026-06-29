import { Test, TestingModule } from '@nestjs/testing';
import { TrainingService } from './training.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Training } from './entities/training.entity';
import { TrainingMaterial } from './entities/training-material.entity';
import { TrainingAssignment } from './entities/training-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { NotFoundException } from '@nestjs/common';
import { TrainingStatusEnum } from '../../common/enums/training-status.enum';

import { TrainingTypeEnum } from '../../common/enums/training-type.enum';

describe('TrainingService', () => {
  let service: TrainingService;
  let trainingRepo: any;
  let departmentRepo: any;
  let assignmentRepo: any;
  let employeeRepo: any;

  const mockTraining = {
    id: 'train-123',
    title: 'NestJS Backend Training',
    description: 'Learn NestJS basics',
    departmentId: 'dept-123',
  };

  const mockAssignment = {
    id: 'assign-123',
    trainingId: 'train-123',
    employeeId: 'emp-123',
    status: TrainingStatusEnum.PENDING,
    progressPercentage: 0,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        { provide: getRepositoryToken(Training), useFactory: mockRepository },
        {
          provide: getRepositoryToken(TrainingMaterial),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(TrainingAssignment),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
    trainingRepo = module.get(getRepositoryToken(Training));
    departmentRepo = module.get(getRepositoryToken(Department));
    assignmentRepo = module.get(getRepositoryToken(TrainingAssignment));
    employeeRepo = module.get(getRepositoryToken(Employee));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'NestJS',
      description: 'Learn Nest',
      departmentId: 'dept-123',
      type: TrainingTypeEnum.MANDATORY,
    };

    it('should successfully create training if department exists', async () => {
      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      trainingRepo.create.mockReturnValue(mockTraining);
      trainingRepo.save.mockResolvedValue(mockTraining);
      trainingRepo.findOne.mockResolvedValue(mockTraining); // inside findOne

      const result = await service.create(createDto, 'hr-123');
      expect(result).toEqual(mockTraining);
    });

    it('should throw NotFoundException if department not found', async () => {
      departmentRepo.findOne.mockResolvedValue(null);
      await expect(service.create(createDto, 'hr-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startTraining', () => {
    it('should set status to IN_PROGRESS and progress to 50%', async () => {
      const pendingAssign = {
        ...mockAssignment,
        status: TrainingStatusEnum.PENDING,
      };
      assignmentRepo.findOne.mockResolvedValue(pendingAssign);
      assignmentRepo.save.mockResolvedValue(pendingAssign);

      const result = await service.startTraining('train-123', 'emp-123');
      expect(result.status).toBe(TrainingStatusEnum.IN_PROGRESS);
      expect(result.progressPercentage).toBe(50);
      expect(assignmentRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignment not found', async () => {
      assignmentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.startTraining('train-123', 'emp-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeTraining', () => {
    it('should set status to COMPLETED and progress to 100%', async () => {
      const activeAssign = {
        ...mockAssignment,
        status: TrainingStatusEnum.IN_PROGRESS,
      };
      assignmentRepo.findOne.mockResolvedValue(activeAssign);
      assignmentRepo.save.mockResolvedValue(activeAssign);

      const result = await service.completeTraining('train-123', 'emp-123');
      expect(result.status).toBe(TrainingStatusEnum.COMPLETED);
      expect(result.progressPercentage).toBe(100);
      expect(assignmentRepo.save).toHaveBeenCalled();
    });
  });
});
