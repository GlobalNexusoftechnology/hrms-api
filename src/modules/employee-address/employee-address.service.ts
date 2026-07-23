import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeAddress } from './entities/employee-address.entity';
import { CreateEmployeeAddressDto } from './dto/create-employee-address.dto';
import { UpdateEmployeeAddressDto } from './dto/update-employee-address.dto';

@Injectable()
export class EmployeeAddressService {
  constructor(
    @InjectRepository(EmployeeAddress)
    private readonly addressRepository: Repository<EmployeeAddress>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeAddressDto): Promise<EmployeeAddress> {
    if (dto.isPrimary) {
      await this.resetPrimaryStatus(employeeId);
    }
    const address = this.addressRepository.create({ ...dto, employeeId });
    return this.addressRepository.save(address);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeAddress[]> {
    return this.addressRepository.find({ where: { employeeId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeAddress> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(id: string, dto: UpdateEmployeeAddressDto): Promise<EmployeeAddress> {
    const address = await this.findOne(id);
    
    if (dto.isPrimary && !address.isPrimary) {
      await this.resetPrimaryStatus(address.employeeId);
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async remove(id: string): Promise<void> {
    const address = await this.findOne(id);
    await this.addressRepository.remove(address);
  }

  private async resetPrimaryStatus(employeeId: string): Promise<void> {
    await this.addressRepository.update(
      { employeeId, isPrimary: true },
      { isPrimary: false }
    );
  }
}
