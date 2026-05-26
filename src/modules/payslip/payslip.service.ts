import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import PDFDocument from 'pdfkit';

import { Response } from 'express';

import { Payroll } from './../payroll/entities/payroll.entity';

import { formatCurrency } from './helpers/payslip.helper';

import { getMonthName } from './helpers/payslip.helper';

@Injectable()
export class PayslipService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,
  ) {}

  // =====================
  // DOWNLOAD PAYSLIP
  // =====================

  async downloadPayslip(
    payrollId: string,

    res: Response,
  ) {
    const payroll = await this.payrollRepo.findOne({
      where: {
        id: payrollId,
      },

      relations: {
        employee: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    const employee = payroll.employee;

    const doc = new PDFDocument({
      margin: 50,
    });

    const fileName = `Payslip-${employee.employeeCode}-${payroll.month}-${payroll.year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    doc.fontSize(22).text('PAYSLIP', {
      align: 'center',
    });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Month: ${getMonthName(payroll.month)} ${payroll.year}`);

    doc.moveDown();

    doc.fontSize(14).text('Employee Details');

    doc.moveDown(0.5);

    doc.fontSize(11).text(`Employee Code: ${employee.employeeCode}`);

    doc.text(`Name: ${employee.firstName} ${employee.lastName}`);

    doc.text(`Email: ${employee.email}`);

    doc.moveDown();

    doc.fontSize(14).text('Attendance Summary');

    doc.moveDown(0.5);

    doc.text(`Present Days: ${payroll.presentDays}`);

    doc.text(`Late Days: ${payroll.lateDays}`);

    doc.text(`Half Days: ${payroll.halfDays}`);

    doc.text(`Absent Days: ${payroll.absentDays}`);

    doc.text(`Paid Leaves: ${payroll.paidLeaves}`);

    doc.text(`Unpaid Leaves: ${payroll.unpaidLeaves}`);

    doc.moveDown();

    doc.fontSize(14).text('Salary Breakdown');

    doc.moveDown(0.5);

    doc.text(`Gross Salary: ${formatCurrency(payroll.grossSalary)}`);

    doc.text(`Net Salary: ${formatCurrency(payroll.netSalary)}`);

    doc.text(`Absent Deduction: ${formatCurrency(payroll.absentDeduction)}`);

    doc.text(`Half Day Deduction: ${formatCurrency(payroll.halfDayDeduction)}`);

    doc.text(`Leave Deduction: ${formatCurrency(payroll.leaveDeduction)}`);

    doc.text(`Overtime Amount: ${formatCurrency(payroll.overtimeAmount)}`);

    doc.moveDown();

    doc
      .fontSize(16)
      .text(`Final Salary: ${formatCurrency(payroll.finalSalary)}`, {
        underline: true,
      });

    doc.moveDown();

    doc.fontSize(14).text('Payment Status');

    doc.moveDown(0.5);

    doc.text(`Status: ${payroll.isPaid ? 'PAID' : 'UNPAID'}`);

    doc.text(
      `Paid At: ${payroll.paidAt ? payroll.paidAt.toISOString() : 'N/A'}`,
    );

    doc.moveDown(2);

    doc.fontSize(10).text('This is a system-generated payslip.', {
      align: 'center',
    });

    doc.end();
  }

  async validateOwnership(
    payrollId: string,

    employeeId: string,
  ) {
    const payroll = await this.payrollRepo.findOne({
      where: {
        id: payrollId,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return payroll.employeeId === employeeId;
  }
}
