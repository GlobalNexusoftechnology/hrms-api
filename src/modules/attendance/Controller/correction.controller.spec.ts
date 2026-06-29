import { Test, TestingModule } from '@nestjs/testing';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from '../Service/correction.service';

describe('CorrectionController', () => {
  let controller: CorrectionController;
  let service: CorrectionService;

  const mockCorrectionService = {
    requestCorrection: jest.fn().mockResolvedValue({ message: 'Success' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorrectionController],
      providers: [
        {
          provide: CorrectionService,
          useValue: mockCorrectionService,
        },
      ],
    }).compile();

    controller = module.get<CorrectionController>(CorrectionController);
    service = module.get<CorrectionService>(CorrectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestCorrection', () => {
    it('should call correctionService.requestCorrection', async () => {
      const user = { id: 'emp-123' };
      const dto = {
        attendanceId: 'att-123',
        checkIn: '09:00',
        checkOut: '18:00',
        reason: 'Forgot',
      };
      const result = await controller.requestCorrection(user, dto as any);
      expect(result).toEqual({ message: 'Success' });
      expect(mockCorrectionService.requestCorrection).toHaveBeenCalledWith(
        'emp-123',
        dto,
      );
    });
  });
});
