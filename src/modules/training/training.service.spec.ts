import { Test, TestingModule } from '@nestjs/testing';
import { TrainingService } from './training.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseModule } from './entities/course-module.entity';
import { CourseTopic } from './entities/course-topic.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { AssessmentOption } from './entities/assessment-option.entity';
import { CourseAssignment } from './entities/course-assignment.entity';
import { TopicProgress } from './entities/topic-progress.entity';
import { ModuleProgress } from './entities/module-progress.entity';
import { AssessmentAttempt } from './entities/assessment-attempt.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { NotFoundException } from '@nestjs/common';

describe('TrainingService', () => {
  let service: TrainingService;
  let courseRepo: any;
  let departmentRepo: any;

  const mockCourse = {
    id: 'course-123',
    title: 'NestJS Backend Training',
    description: 'Learn NestJS basics',
    departmentId: 'dept-123',
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
        { provide: getRepositoryToken(Course), useFactory: mockRepository },
        { provide: getRepositoryToken(CourseModule), useFactory: mockRepository },
        { provide: getRepositoryToken(CourseTopic), useFactory: mockRepository },
        { provide: getRepositoryToken(CourseMaterial), useFactory: mockRepository },
        { provide: getRepositoryToken(Assessment), useFactory: mockRepository },
        { provide: getRepositoryToken(AssessmentQuestion), useFactory: mockRepository },
        { provide: getRepositoryToken(AssessmentOption), useFactory: mockRepository },
        { provide: getRepositoryToken(CourseAssignment), useFactory: mockRepository },
        { provide: getRepositoryToken(TopicProgress), useFactory: mockRepository },
        { provide: getRepositoryToken(ModuleProgress), useFactory: mockRepository },
        { provide: getRepositoryToken(AssessmentAttempt), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
    courseRepo = module.get(getRepositoryToken(Course));
    departmentRepo = module.get(getRepositoryToken(Department));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    const createDto = {
      title: 'NestJS',
      description: 'Learn Nest',
      departmentId: 'dept-123',
    } as any;

    it('should successfully create course if department exists', async () => {
      departmentRepo.findOne.mockResolvedValue({ id: 'dept-123' });
      courseRepo.create.mockReturnValue(mockCourse);
      courseRepo.save.mockResolvedValue(mockCourse);

      const result = await service.createCourse(createDto, 'hr-123');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if department not found', async () => {
      departmentRepo.findOne.mockResolvedValue(null);
      await expect(service.createCourse(createDto, 'hr-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
