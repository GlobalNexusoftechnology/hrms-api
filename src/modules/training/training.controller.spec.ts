import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

describe('TrainingController', () => {
  let controller: TrainingController;
  let service: TrainingService;

  const mockTrainingService = {
    getMyCourses: jest.fn().mockResolvedValue([]),
    getCourseDetails: jest.fn().mockResolvedValue({}),
    completeTopic: jest.fn().mockResolvedValue({ success: true }),
    submitAssessment: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: mockTrainingService,
        },
      ],
    }).compile();

    controller = module.get<TrainingController>(TrainingController);
    service = module.get<TrainingService>(TrainingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyCourses', () => {
    it('should call service.getMyCourses', async () => {
      const mockUser = { id: 'emp-123' } as any;
      const result = await controller.getMyCourses(mockUser);
      expect(result).toEqual([]);
      expect(mockTrainingService.getMyCourses).toHaveBeenCalledWith(
        'emp-123',
      );
    });
  });

  describe('getCourseDetails', () => {
    it('should call service.getCourseDetails', async () => {
      const mockUser = { id: 'emp-123' } as any;
      const result = await controller.getCourseDetails('course-123', mockUser);
      expect(result).toEqual({});
      expect(mockTrainingService.getCourseDetails).toHaveBeenCalledWith(
        'course-123',
        'emp-123',
      );
    });
  });

  describe('completeTopic', () => {
    it('should call service.completeTopic', async () => {
      const mockUser = { id: 'emp-123' } as any;
      const result = await controller.completeTopic('topic-123', mockUser);
      expect(result).toEqual({ success: true });
      expect(mockTrainingService.completeTopic).toHaveBeenCalledWith(
        'topic-123',
        'emp-123',
      );
    });
  });

  describe('submitAssessment', () => {
    it('should call service.submitAssessment', async () => {
      const mockUser = { id: 'emp-123' } as any;
      const dto = { answers: [] };
      const result = await controller.submitAssessment('mod-123', dto as any, mockUser);
      expect(result).toEqual({ success: true });
      expect(mockTrainingService.submitAssessment).toHaveBeenCalledWith(
        'mod-123',
        'emp-123',
        dto,
      );
    });
  });
});
