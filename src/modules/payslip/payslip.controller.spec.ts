import { Test, TestingModule } from '@nestjs/testing';
import { PayslipController } from './payslip.controller';
import { PayslipService } from './payslip.service';
import { Response } from 'express';
import { ForbiddenException } from '@nestjs/common';

describe('PayslipController', () => {
  let controller: PayslipController;
  let service: PayslipService;

  const mockPayslipService = {
    downloadPayslip: jest.fn().mockResolvedValue(undefined),
    validateOwnership: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayslipController],
      providers: [
        {
          provide: PayslipService,
          useValue: mockPayslipService,
        },
      ],
    }).compile();

    controller = module.get<PayslipController>(PayslipController);
    service = module.get<PayslipService>(PayslipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('downloadByHr', () => {
    it('should call service.downloadPayslip', async () => {
      const mockRes = {} as Response;
      await controller.downloadByHr('pay-123', mockRes);
      expect(mockPayslipService.downloadPayslip).toHaveBeenCalledWith(
        'pay-123',
        mockRes,
      );
    });
  });

  describe('downloadMyPayslip', () => {
    it('should download if user is owner', async () => {
      const mockRes = {} as Response;
      const user = { id: 'emp-123' };
      mockPayslipService.validateOwnership.mockResolvedValue(true);

      await controller.downloadMyPayslip('pay-123', user, mockRes);
      expect(mockPayslipService.validateOwnership).toHaveBeenCalledWith(
        'pay-123',
        'emp-123',
      );
      expect(mockPayslipService.downloadPayslip).toHaveBeenCalledWith(
        'pay-123',
        mockRes,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockRes = {} as Response;
      const user = { id: 'emp-123' };
      mockPayslipService.validateOwnership.mockResolvedValue(false);

      await expect(
        controller.downloadMyPayslip('pay-123', user, mockRes),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
