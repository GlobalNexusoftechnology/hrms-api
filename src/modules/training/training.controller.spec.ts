import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

describe('TrainingController', () => {
  let controller: TrainingController;
  let service: TrainingService;

  const mockTrainingService = {
    getMyTrainings: jest.fn().mockResolvedValue([]),
    getTrainingDetails: jest.fn().mockResolvedValue({}),
    startTraining: jest.fn().mockResolvedValue({ status: 'in-progress' }),
    completeTraining: jest.fn().mockResolvedValue({ status: 'completed' }),
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

  describe('getMyTrainings', () => {
    it('should call service.getMyTrainings', async () => {
      const mockReq = { user: { id: 'emp-123' } } as any;
      const result = await controller.getMyTrainings(mockReq);
      expect(result).toEqual([]);
      expect(mockTrainingService.getMyTrainings).toHaveBeenCalledWith(
        'emp-123',
      );
    });
  });

  describe('getTrainingDetails', () => {
    it('should call service.getTrainingDetails', async () => {
      const mockReq = { user: { id: 'emp-123' } } as any;
      const result = await controller.getTrainingDetails('train-123', mockReq);
      expect(result).toEqual({});
      expect(mockTrainingService.getTrainingDetails).toHaveBeenCalledWith(
        'train-123',
        'emp-123',
      );
    });
  });

  describe('startTraining', () => {
    it('should call service.startTraining', async () => {
      const mockReq = { user: { id: 'emp-123' } } as any;
      const result = await controller.startTraining('train-123', mockReq);
      expect(result.status).toBe('in-progress');
      expect(mockTrainingService.startTraining).toHaveBeenCalledWith(
        'train-123',
        'emp-123',
      );
    });
  });

  describe('completeTraining', () => {
    it('should call service.completeTraining', async () => {
      const mockReq = { user: { id: 'emp-123' } } as any;
      const result = await controller.completeTraining('train-123', mockReq);
      expect(result.status).toBe('completed');
      expect(mockTrainingService.completeTraining).toHaveBeenCalledWith(
        'train-123',
        'emp-123',
      );
    });
  });
});
