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

  private getComponentAmount(salary: any, possibleNames: string[]): number {
    if (!salary || !salary.components) return 0;
    const match = salary.components.find((c: any) =>
      possibleNames.some(name => c.componentName.toLowerCase().includes(name.toLowerCase())) ||
      possibleNames.some(name => c.salaryComponent?.code?.toLowerCase() === name.toLowerCase())
    );
    return match ? Number(match.calculatedAmount) : 0;
  }

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
          salaryStructures: {
            components: {
              salaryComponent: true,
            },
          },
          branch: {
            organization: true,
          },
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
    const branch = employee.branch;
    const org = branch?.organization;

    const companyName = org?.name || branch?.name || 'GigaNexus Technologies';
    const companyAddress = [branch?.line1, branch?.line2, branch?.city, branch?.state].filter(Boolean).join(', ') || '123 Tech Park, Cyber City';
    const companyEmail = branch?.email || 'hr@giganexus.com';
    const companyPhone = branch?.phone || '+1 234 567 8900';

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    const fileName = `Payslip-${employee.employeeCode}-${payroll.month}-${payroll.year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // ==========================================
    // 1. CORPORATE HEADER (BEAUTIFUL UI)
    // ==========================================
    // Top colored banner
    doc.rect(0, 0, 595, 100).fillColor('#003366').fill();
    
    doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold').text(companyName, 50, 30);
    
    doc.fontSize(10).font('Helvetica').text(companyAddress, 50, 60);
    doc.fontSize(10).text(`Email: ${companyEmail} | Phone: ${companyPhone}`, 50, 75);

    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('PAYSLIP', 0, 30, { align: 'right', width: 545 });
    doc.fontSize(12).font('Helvetica').text(`For the month of ${getMonthName(payroll.month)} ${payroll.year}`, 0, 60, { align: 'right', width: 545 });
    
    // Reset colors for body
    doc.fillColor('#000000');

    // ==========================================
    // 2. EMPLOYEE DETAILS GRID
    // ==========================================
    const topY = 125;
    
    // Section Background
    doc.rect(45, topY - 10, 505, 75).fillColor('#f8f9fa').fill();
    doc.rect(45, topY - 10, 505, 75).lineWidth(1).strokeColor('#e9ecef').stroke();
    
    doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text('Employee Code:', 55, topY);
    doc.font('Helvetica').text(employee.employeeCode, 150, topY);
    
    doc.font('Helvetica-Bold').text('Department:', 300, topY);
    doc.font('Helvetica').text(employee.department?.name || 'N/A', 400, topY);
    
    doc.font('Helvetica-Bold').text('Name:', 55, topY + 20);
    doc.font('Helvetica').text(`${employee.firstName} ${employee.lastName}`, 150, topY + 20);
    
    doc.font('Helvetica-Bold').text('Designation:', 300, topY + 20);
    doc.font('Helvetica').text(employee.designation?.name || 'N/A', 400, topY + 20);
    
    doc.font('Helvetica-Bold').text('Email:', 55, topY + 40);
    doc.font('Helvetica').text(employee.email, 150, topY + 40);
    
    doc.font('Helvetica-Bold').text('Date of Joining:', 300, topY + 40);
    doc.font('Helvetica').text(employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A', 400, topY + 40);

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
    
    const earningComponents = payroll.componentsData?.filter(c => c.type === 'EARNING') || [];
    earningComponents.forEach(c => drawEarning(c.componentName, Number(c.amount)));

    drawEarning('Overtime', Number(payroll.overtimeAmount));
    drawEarning('Leave Encashment', Number(payroll.encashmentAmount));
    if (Number(payroll.bonusAmount) > 0) drawEarning(`Bonus ${payroll.bonusReason ? `(${payroll.bonusReason})` : ''}`, Number(payroll.bonusAmount));
    
    // --- DEDUCTIONS ---
    const drawDeduction = (label: string, amount: number, alwaysShow = false) => {
        if (amount > 0 || alwaysShow) {
            doc.text(label, rightColX + 10, dedY);
            doc.text(formatCurrency(amount), rightColX + 145, dedY, { width: 90, align: 'right' });
            dedY += rowHeight;
        }
    };

    const deductionComponents = payroll.componentsData?.filter(c => c.type === 'DEDUCTION') || [];
    deductionComponents.forEach(c => drawDeduction(c.componentName, Number(c.amount)));

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

    const totalDynamicEarnings = earningComponents.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalEarnings = Number(payroll.baseBasicSalary || activeSalary?.basicSalary || 0)
      + totalDynamicEarnings
      + Number(payroll.overtimeAmount || 0)
      + Number(payroll.bonusAmount || 0)
      + Number(payroll.encashmentAmount || 0);

    doc.text(formatCurrency(totalEarnings), leftColX + 145, totalY + 8, { width: 90, align: 'right' });
    
    const totalDynamicDeductions = deductionComponents.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalDeductions = totalDynamicDeductions
      + Number(payroll.absentDeduction || 0)
      + Number(payroll.halfDayDeduction || 0)
      + Number(payroll.leaveDeduction || 0)
      + Number(payroll.lateDeduction || 0)
      + Number(payroll.deductionAmount || 0);

    doc.text('Total Deductions', rightColX + 10, totalY + 8);
    doc.text(formatCurrency(totalDeductions), rightColX + 145, totalY + 8, { width: 90, align: 'right' });

    // ==========================================
    // 5. NET PAY & FOOTER
    // ==========================================
    const netY = tableTop + 220;
    
    // Highlight Box (More modern look)
    doc.rect(345, netY, 200, 45).fillColor('#003366').fill();
    doc.rect(345, netY, 200, 45).lineWidth(1).strokeColor('#002244').stroke();
    
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
    doc.text('NET PAY:', 355, netY + 15);
    doc.fontSize(16).text(formatCurrency(payroll.finalSalary), 430, netY + 14, { width: 105, align: 'right' });

    // Payment Status Text
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    const isPaidText = payroll.isPaid ? 'PAID' : 'UNPAID';
    doc.font('Helvetica-Bold').text(`Payment Status: `, 50, netY + 8);
    doc.fillColor(payroll.isPaid ? '#28a745' : '#dc3545').font('Helvetica-Bold').text(isPaidText, 135, netY + 8);
    
    doc.fillColor('#333333');
    const formattedDate = payroll.paidAt 
      ? payroll.paidAt.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      : 'N/A';
    doc.font('Helvetica-Bold').text(`Processed On: `, 50, netY + 23);
    doc.font('Helvetica').text(formattedDate, 135, netY + 23);

    // Footer signature line
    doc.moveTo(400, netY + 110).lineTo(545, netY + 110).lineWidth(1).strokeColor('#999999').stroke();
    doc.fontSize(10).font('Helvetica-Oblique').text('Authorized Signature', 400, netY + 115, { width: 145, align: 'center' });

    // Bottom decorative bar
    doc.rect(0, 810, 595, 32).fillColor('#003366').fill();
    doc.fontSize(9).font('Helvetica').fillColor('#ffffff').text('This is a system-generated payslip and does not require a physical signature.', 0, 820, { align: 'center', width: 595 });

    doc.end();
  }
}
