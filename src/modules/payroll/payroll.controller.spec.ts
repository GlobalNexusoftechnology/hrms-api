import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

describe('PayrollController', () => {
  let controller: PayrollController;
  let service: PayrollService;

  const mockPayroll = {
    id: 'pay-123',
    employeeId: 'emp-123',
    month: 6,
    year: 2026,
    finalSalary: 5000,
    isPaid: false,
  };

  const mockPayrollService = {
    getMyPayroll: jest
      .fn()
      .mockResolvedValue({ data: [mockPayroll], total: 1 }),
    generatePayroll: jest.fn().mockResolvedValue(mockPayroll),
    findAll: jest.fn().mockResolvedValue({ data: [mockPayroll], meta: {} }),
    markAsPaid: jest.fn().mockResolvedValue({ ...mockPayroll, isPaid: true }),
    generateAllPayroll: jest
      .fn()
      .mockResolvedValue({ generated: 1, skipped: 0, failed: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        {
          provide: PayrollService,
          useValue: mockPayrollService,
        },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
    service = module.get<PayrollService>(PayrollService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyPayroll', () => {
    it('should call service.getMyPayroll', async () => {
      const user = { id: 'emp-123' };
      const result = await controller.getMyPayroll(user);
      expect(result.data).toEqual([mockPayroll]);
      expect(mockPayrollService.getMyPayroll).toHaveBeenCalledWith('emp-123');
    });
  });

  describe('generate', () => {
    it('should call service.generatePayroll', async () => {
      const body = { employeeId: 'emp-123', month: 6, year: 2026 };
      const result = await controller.generate(body);
      expect(result).toEqual(mockPayroll);
      expect(mockPayrollService.generatePayroll).toHaveBeenCalledWith(
        'emp-123',
        6,
        2026,
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const query = { page: '1' };
      const result = await controller.findAll(query);
      expect(result.data).toEqual([mockPayroll]);
      expect(mockPayrollService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('markPaid', () => {
    it('should call service.markAsPaid', async () => {
      const result = await controller.markPaid('pay-123');
      expect(result.isPaid).toBe(true);
      expect(mockPayrollService.markAsPaid).toHaveBeenCalledWith('pay-123');
    });
  });

  describe('generateAll', () => {
    it('should call service.generateAllPayroll', async () => {
      const body = { month: 6, year: 2026 };
      const result = await controller.generateAll(body);
      expect(result.generated).toBe(1);
      expect(mockPayrollService.generateAllPayroll).toHaveBeenCalledWith(
        6,
        2026,
      );
    });
  });
});
