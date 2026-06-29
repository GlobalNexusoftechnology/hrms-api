import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from './../employees/entities/employee.entity';
import { Attendance } from './../attendance/entities/attendance.entity';
import { SalaryStructure } from './../salary-structure/entities/salary-structure.entity';
import { LeaveBalance } from './../leave-balance/entities/leave-balance.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PayrollService', () => {
  let service: PayrollService;
  let payrollRepo: any;
  let employeeRepo: any;
  let attendanceRepo: any;
  let salaryRepo: any;
  let leaveBalanceRepo: any;

  const mockEmployee = { id: 'emp-123', isActive: true };
  const mockSalary = {
    employeeId: 'emp-123',
    netSalary: '30000',
    grossSalary: '35000',
    isActive: true,
  };
  const mockPayroll = {
    id: 'pay-123',
    employeeId: 'emp-123',
    month: 6,
    year: 2026,
    finalSalary: 30000,
    isPaid: false,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: getRepositoryToken(Payroll), useFactory: mockRepository },
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Attendance), useFactory: mockRepository },
        {
          provide: getRepositoryToken(SalaryStructure),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(LeaveBalance),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    payrollRepo = module.get(getRepositoryToken(Payroll));
    employeeRepo = module.get(getRepositoryToken(Employee));
    attendanceRepo = module.get(getRepositoryToken(Attendance));
    salaryRepo = module.get(getRepositoryToken(SalaryStructure));
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalance));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePayroll', () => {
    it('should successfully calculate salary and save payroll record', async () => {
      payrollRepo.findOne.mockResolvedValue(null);
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      salaryRepo.findOne.mockResolvedValue(mockSalary);
      attendanceRepo.find.mockResolvedValue([]);
      leaveBalanceRepo.findOne.mockResolvedValue({
        paidLeavesUsed: 0,
        unpaidLeavesUsed: 0,
      });
      payrollRepo.save.mockResolvedValue(mockPayroll);

      const result = await service.generatePayroll('emp-123', 6, 2026);
      expect(result).toEqual(mockPayroll);
      expect(payrollRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if payroll already generated', async () => {
      payrollRepo.findOne.mockResolvedValue(mockPayroll);
      await expect(service.generatePayroll('emp-123', 6, 2026)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      payrollRepo.findOne.mockResolvedValue(null);
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.generatePayroll('emp-123', 6, 2026)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsPaid', () => {
    it('should set isPaid true and update paidAt timestamp', async () => {
      payrollRepo.findOne.mockResolvedValue(mockPayroll);
      payrollRepo.save.mockResolvedValue({ ...mockPayroll, isPaid: true });

      const result = await service.markAsPaid('pay-123');
      expect(result.isPaid).toBe(true);
      expect(payrollRepo.save).toHaveBeenCalled();
    });
  });
});
