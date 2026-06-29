import { Test, TestingModule } from '@nestjs/testing';
import { HrTrainingController } from './hr-training.controller';
import { TrainingService } from './training.service';

describe('HrTrainingController', () => {
  let controller: HrTrainingController;
  let service: TrainingService;

  const mockTrainingService = {
    create: jest.fn().mockResolvedValue({ id: 'train-123' }),
    update: jest.fn().mockResolvedValue({ id: 'train-123' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'train-123' }),
    addMaterial: jest.fn().mockResolvedValue({ id: 'mat-123' }),
    assignTraining: jest.fn().mockResolvedValue({ success: true }),
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

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { title: 'JS' };
      const req = { user: { id: 'hr-123' } } as any;
      const result = await controller.create(dto as any, req);
      expect(result).toEqual({ id: 'train-123' });
      expect(mockTrainingService.create).toHaveBeenCalledWith(dto, 'hr-123');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { title: 'JS Updated' };
      const result = await controller.update('train-123', dto);
      expect(result).toEqual({ id: 'train-123' });
      expect(mockTrainingService.update).toHaveBeenCalledWith('train-123', dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(mockTrainingService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const result = await controller.findOne('train-123');
      expect(result).toEqual({ id: 'train-123' });
      expect(mockTrainingService.findOne).toHaveBeenCalledWith('train-123');
    });
  });

  describe('addMaterial', () => {
    it('should call service.addMaterial', async () => {
      const dto = { title: 'material doc' };
      const result = await controller.addMaterial('train-123', dto as any);
      expect(result).toEqual({ id: 'mat-123' });
      expect(mockTrainingService.addMaterial).toHaveBeenCalledWith(
        'train-123',
        dto,
      );
    });
  });

  describe('assignTraining', () => {
    it('should call service.assignTraining', async () => {
      const dto = { employeeIds: ['emp-123'] };
      const result = await controller.assignTraining('train-123', dto);
      expect(result).toEqual({ success: true });
      expect(mockTrainingService.assignTraining).toHaveBeenCalledWith(
        'train-123',
        ['emp-123'],
      );
    });
  });
});
