import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeBank } from './entities/employee-bank.entity';
import { CreateEmployeeBankDto } from './dto/create-employee-bank.dto';
import { UpdateEmployeeBankDto } from './dto/update-employee-bank.dto';

@Injectable()
export class EmployeeBankService {
  constructor(
    @InjectRepository(EmployeeBank)
    private readonly bankRepository: Repository<EmployeeBank>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeBankDto): Promise<EmployeeBank> {
    if (dto.isPrimary) {
      await this.resetPrimaryStatus(employeeId);
    }
    const bank = this.bankRepository.create({ ...dto, employeeId });
    return this.bankRepository.save(bank);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeBank[]> {
    return this.bankRepository.find({ where: { employeeId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeBank> {
    const bank = await this.bankRepository.findOne({ where: { id } });
    if (!bank) {
      throw new NotFoundException('Bank account not found');
    }
    return bank;
  }

  async update(id: string, dto: UpdateEmployeeBankDto): Promise<EmployeeBank> {
    const bank = await this.findOne(id);
    
    if (dto.isPrimary && !bank.isPrimary) {
      await this.resetPrimaryStatus(bank.employeeId);
    }

    Object.assign(bank, dto);
    return this.bankRepository.save(bank);
  }

  async remove(id: string): Promise<void> {
    const bank = await this.findOne(id);
    await this.bankRepository.remove(bank);
  }

  private async resetPrimaryStatus(employeeId: string): Promise<void> {
    await this.bankRepository.update(
      { employeeId, isPrimary: true },
      { isPrimary: false }
    );
  }
}
