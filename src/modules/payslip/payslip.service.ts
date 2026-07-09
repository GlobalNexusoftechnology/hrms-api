import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

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
    requestedByEmployeeId?: string,
  ) {
    const payroll = await this.payrollRepo.findOne({
      where: {
        id: payrollId,
      },

      relations: {
        employee: {
          department: true,
          designation: true,
          salaryStructures: true,
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (requestedByEmployeeId) {
      if (payroll.employeeId !== requestedByEmployeeId) {
        throw new ForbiddenException('You can only access your own payslip');
      }
      if (!payroll.isPaid) {
        throw new ForbiddenException('Payslip is not yet released');
      }
    }

    const employee = payroll.employee;
    const activeSalary = employee.salaryStructures?.find(s => s.isActive);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    const fileName = `Payslip-${employee.employeeCode}-${payroll.month}-${payroll.year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // ==========================================
    // 1. CORPORATE HEADER
    // ==========================================
    doc.fontSize(24).font('Helvetica-Bold').text('GigaNexus Technologies', 50, 50);
    doc.fontSize(10).font('Helvetica').text('123 Tech Park, Cyber City', 50, 75);
    doc.fontSize(10).text('Email: hr@giganexus.com | Phone: +1 234 567 8900', 50, 90);

    doc.fontSize(22).font('Helvetica-Bold').text('PAYSLIP', 0, 50, { align: 'right', width: 545 });
    doc.fontSize(12).font('Helvetica').text(`For the month of ${getMonthName(payroll.month)} ${payroll.year}`, 0, 75, { align: 'right', width: 545 });
    
    // Draw horizontal line
    doc.moveTo(50, 115).lineTo(545, 115).lineWidth(1).strokeColor('#dddddd').stroke();

    // ==========================================
    // 2. EMPLOYEE DETAILS GRID
    // ==========================================
    const topY = 135;
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('Employee Code:', 50, topY);
    doc.font('Helvetica').text(employee.employeeCode, 150, topY);
    
    doc.font('Helvetica-Bold').text('Department:', 300, topY);
    doc.font('Helvetica').text(employee.department?.name || 'N/A', 400, topY);
    
    doc.font('Helvetica-Bold').text('Name:', 50, topY + 20);
    doc.font('Helvetica').text(`${employee.firstName} ${employee.lastName}`, 150, topY + 20);
    
    doc.font('Helvetica-Bold').text('Designation:', 300, topY + 20);
    doc.font('Helvetica').text(employee.designation?.name || 'N/A', 400, topY + 20);
    
    doc.font('Helvetica-Bold').text('Email:', 50, topY + 50);
    doc.font('Helvetica').text(employee.email, 150, topY + 50);
    
    doc.font('Helvetica-Bold').text('Date of Joining:', 300, topY + 50);
    doc.font('Helvetica').text(employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A', 400, topY + 50);

    // ==========================================
    // 3. ATTENDANCE SUMMARY
    // ==========================================
    const attY = topY + 90;
    doc.rect(50, attY - 10, 495, 40).fillColor('#f7f7f7').fill();
    doc.fillColor('#000000');
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Working Days', 60, attY);
    doc.text('Present', 130, attY);
    doc.text('Absent', 190, attY);
    doc.text('Half Days', 250, attY);
    doc.text('Late', 320, attY);
    doc.text('Paid Leaves', 380, attY);
    doc.text('Unpaid Leaves', 460, attY);

    doc.fontSize(10).font('Helvetica');
    const totalWorkingDays = payroll.presentDays + payroll.absentDays + payroll.halfDays + payroll.paidLeaves + payroll.unpaidLeaves;
    doc.text(`${totalWorkingDays}`, 60, attY + 15);
    doc.text(`${payroll.presentDays}`, 130, attY + 15);
    doc.text(`${payroll.absentDays}`, 190, attY + 15);
    doc.text(`${payroll.halfDays}`, 250, attY + 15);
    doc.text(`${payroll.lateDays}`, 320, attY + 15);
    doc.text(`${payroll.paidLeaves}`, 380, attY + 15);
    doc.text(`${payroll.unpaidLeaves}`, 460, attY + 15);

    // ==========================================
    // 4. EARNINGS & DEDUCTIONS TABLE
    // ==========================================
    const tableTop = attY + 60;
    const leftColX = 50;
    const rightColX = 300;
    
    // Draw table border
    doc.rect(50, tableTop, 495, 200).lineWidth(1).strokeColor('#dddddd').stroke();
    // Center divider
    doc.moveTo(297, tableTop).lineTo(297, tableTop + 200).stroke();
    
    // Header Row Background
    doc.rect(50, tableTop, 495, 25).fillColor('#eeeeee').fill();
    doc.fillColor('#000000').strokeColor('#dddddd');
    doc.moveTo(50, tableTop + 25).lineTo(545, tableTop + 25).stroke();
    
    // Header Text
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('EARNINGS', leftColX + 10, tableTop + 7);
    doc.text('AMOUNT', leftColX + 175, tableTop + 7, { width: 60, align: 'right' });
    doc.text('DEDUCTIONS', rightColX + 10, tableTop + 7);
    doc.text('AMOUNT', rightColX + 175, tableTop + 7, { width: 60, align: 'right' });

    // Populate Rows
    doc.font('Helvetica').fontSize(10);
    let earnY = tableTop + 35;
    let dedY = tableTop + 35;
    const rowHeight = 20;

    // --- EARNINGS ---
    const drawEarning = (label: string, amount: number, alwaysShow = false) => {
        if (amount > 0 || alwaysShow) {
            doc.text(label, leftColX + 10, earnY);
            doc.text(formatCurrency(amount), leftColX + 145, earnY, { width: 90, align: 'right' });
            earnY += rowHeight;
        }
    };
    drawEarning('Basic Pay', Number(payroll.baseBasicSalary) || Number(activeSalary?.basicSalary || 0), true);
    drawEarning('House Rent Allowance', Number(payroll.baseHra) || Number(activeSalary?.hra || 0), true);
    drawEarning('Special Allowance', Number(payroll.baseAllowance) || Number(activeSalary?.allowance || 0), true);
    drawEarning('Overtime', Number(payroll.overtimeAmount));
    if (Number(payroll.bonusAmount) > 0) drawEarning(`Bonus ${payroll.bonusReason ? `(${payroll.bonusReason})` : ''}`, Number(payroll.bonusAmount));
    
    // --- DEDUCTIONS ---
    const drawDeduction = (label: string, amount: number, alwaysShow = false) => {
        if (amount > 0 || alwaysShow) {
            doc.text(label, rightColX + 10, dedY);
            doc.text(formatCurrency(amount), rightColX + 145, dedY, { width: 90, align: 'right' });
            dedY += rowHeight;
        }
    };
    drawDeduction('Provident Fund (PF)', Number(payroll.basePf) || Number(activeSalary?.pf || 0), true);
    drawDeduction('ESIC', Number(payroll.baseEsic) || Number(activeSalary?.esic || 0), true);
    drawDeduction('Professional Tax', Number(payroll.baseProfessionalTax) || Number(activeSalary?.professionalTax || 0), true);
    drawDeduction('Absent Penalty', Number(payroll.absentDeduction));
    drawDeduction('Half Day Penalty', Number(payroll.halfDayDeduction));
    drawDeduction('Leave Penalty', Number(payroll.leaveDeduction));
    drawDeduction('Late Penalty', Number(payroll.lateDeduction));
    if (Number(payroll.deductionAmount) > 0) drawDeduction(`Other ${payroll.deductionReason ? `(${payroll.deductionReason})` : ''}`, Number(payroll.deductionAmount));

    // Totals Row
    const totalY = tableTop + 175;
    doc.moveTo(50, totalY).lineTo(545, totalY).stroke();
    doc.font('Helvetica-Bold');
    doc.text('Total Gross Earnings', leftColX + 10, totalY + 8);
    doc.text(formatCurrency(payroll.grossSalary), leftColX + 145, totalY + 8, { width: 90, align: 'right' });
    
    const totalDeductions = Number(payroll.grossSalary) - Number(payroll.finalSalary);
    doc.text('Total Deductions', rightColX + 10, totalY + 8);
    doc.text(formatCurrency(totalDeductions), rightColX + 145, totalY + 8, { width: 90, align: 'right' });

    // ==========================================
    // 5. NET PAY & FOOTER
    // ==========================================
    const netY = tableTop + 220;
    
    // Highlight Box
    doc.rect(345, netY, 200, 40).fillColor('#e6f2ff').fill();
    doc.rect(345, netY, 200, 40).lineWidth(1).strokeColor('#99ccff').stroke();
    
    doc.fillColor('#003366').fontSize(14).font('Helvetica-Bold');
    doc.text('NET PAY:', 355, netY + 12);
    doc.fontSize(16).text(formatCurrency(payroll.finalSalary), 430, netY + 10, { width: 105, align: 'right' });

    // Payment Status Text
    doc.fillColor('#000000').fontSize(10).font('Helvetica');
    const isPaidText = payroll.isPaid ? 'PAID' : 'UNPAID';
    doc.font('Helvetica-Bold').text(`Payment Status: `, 50, netY + 5);
    doc.font('Helvetica').text(isPaidText, 135, netY + 5);
    
    const formattedDate = payroll.paidAt 
      ? payroll.paidAt.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      : 'N/A';
    doc.font('Helvetica-Bold').text(`Processed On: `, 50, netY + 20);
    doc.font('Helvetica').text(formattedDate, 135, netY + 20);

    // Footer signature line
    doc.moveTo(400, netY + 100).lineTo(545, netY + 100).strokeColor('#000000').stroke();
    doc.fontSize(10).text('Authorized Signature', 400, netY + 105, { width: 145, align: 'center' });

    doc.fontSize(9).fillColor('#666666').text('This is a system-generated payslip and does not require a physical signature.', 50, 750, { align: 'center' });

    doc.end();
  }
}
