import { Test, TestingModule } from '@nestjs/testing';
import { PayslipService } from './payslip.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payroll } from './../payroll/entities/payroll.entity';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    end: jest.fn(),
  }));
});

describe('PayslipService', () => {
  let service: PayslipService;
  let payrollRepo: any;

  const mockEmployee = {
    employeeCode: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockPayroll = {
    id: 'pay-123',
    employeeId: 'emp-123',
    month: 6,
    year: 2026,
    grossSalary: 1000,
    netSalary: 900,
    presentDays: 30,
    lateDays: 0,
    halfDays: 0,
    absentDays: 0,
    paidLeaves: 0,
    unpaidLeaves: 0,
    finalSalary: 900,
    employee: mockEmployee,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayslipService,
        {
          provide: getRepositoryToken(Payroll),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PayslipService>(PayslipService);
    payrollRepo = module.get(getRepositoryToken(Payroll));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('downloadPayslip', () => {
    it('should generate PDF streams successfully', async () => {
      payrollRepo.findOne.mockResolvedValue(mockPayroll);
      const mockRes = {
        setHeader: jest.fn(),
      } as any as Response;

      await service.downloadPayslip('pay-123', mockRes);
      expect(payrollRepo.findOne).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
    });

    it('should throw NotFoundException if payroll is not found', async () => {
      payrollRepo.findOne.mockResolvedValue(null);
      const mockRes = {} as Response;
      await expect(service.downloadPayslip('invalid', mockRes)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateOwnership', () => {
    it('should return true if employeeId matches', async () => {
      payrollRepo.findOne.mockResolvedValue(mockPayroll);
      const result = await service.validateOwnership('pay-123', 'emp-123');
      expect(result).toBe(true);
    });

    it('should return false if employeeId mismatches', async () => {
      payrollRepo.findOne.mockResolvedValue(mockPayroll);
      const result = await service.validateOwnership('pay-123', 'other-id');
      expect(result).toBe(false);
    });
  });
});
