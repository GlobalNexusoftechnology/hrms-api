import { Test, TestingModule } from '@nestjs/testing';
import { HrTrainingController } from './hr-training.controller';
import { TrainingService } from './training.service';

describe('HrTrainingController', () => {
  let controller: HrTrainingController;
  let service: TrainingService;

  const mockTrainingService = {
    createCourse: jest.fn().mockResolvedValue({ id: 'course-123' }),
    updateCourse: jest.fn().mockResolvedValue({ id: 'course-123' }),
    getAllCourses: jest.fn().mockResolvedValue([]),
    getCourseById: jest.fn().mockResolvedValue({ id: 'course-123' }),
    addMaterial: jest.fn().mockResolvedValue({ id: 'mat-123' }),
    assignCourse: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrTrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: mockTrainingService,
        },
      ],
    }).compile();

    controller = module.get<HrTrainingController>(HrTrainingController);
    service = module.get<TrainingService>(TrainingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCourse', () => {
    it('should call service.createCourse', async () => {
      const dto = { title: 'JS' };
      const mockUser = { id: 'hr-123' } as any;
      const result = await controller.createCourse(dto as any, mockUser);
      expect(result).toEqual({ id: 'course-123' });
      expect(mockTrainingService.createCourse).toHaveBeenCalledWith(dto, 'hr-123');
    });
  });

  describe('updateCourse', () => {
    it('should call service.updateCourse', async () => {
      const dto = { title: 'JS Updated' };
      const result = await controller.updateCourse('course-123', dto);
      expect(result).toEqual({ id: 'course-123' });
      expect(mockTrainingService.updateCourse).toHaveBeenCalledWith('course-123', dto);
    });
  });

  describe('getAllCourses', () => {
    it('should call service.getAllCourses', async () => {
      const result = await controller.getAllCourses();
      expect(result).toEqual([]);
      expect(mockTrainingService.getAllCourses).toHaveBeenCalled();
    });
  });

  describe('getCourseById', () => {
    it('should call service.getCourseById', async () => {
      const result = await controller.getCourseById('course-123');
      expect(result).toEqual({ id: 'course-123' });
      expect(mockTrainingService.getCourseById).toHaveBeenCalledWith('course-123');
    });
  });

  describe('addMaterial', () => {
    it('should call service.addMaterial', async () => {
      const dto = { title: 'material doc' };
      const result = await controller.addMaterial('topic-123', dto as any);
      expect(result).toEqual({ id: 'mat-123' });
      expect(mockTrainingService.addMaterial).toHaveBeenCalledWith(
        'topic-123',
        dto,
      );
    });
  });

  describe('assignCourse', () => {
    it('should call service.assignCourse', async () => {
      const dto = { employeeIds: ['emp-123'] };
      const result = await controller.assignCourse('course-123', dto as any);
      expect(result).toEqual({ success: true });
      expect(mockTrainingService.assignCourse).toHaveBeenCalledWith(
        'course-123',
        dto,
      );
    });
  });
});
