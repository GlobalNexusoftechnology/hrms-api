import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { CreateEmployeeEmergencyContactDto } from './dto/create-employee-emergency-contact.dto';
import { UpdateEmployeeEmergencyContactDto } from './dto/update-employee-emergency-contact.dto';

@Injectable()
export class EmployeeEmergencyContactService {
  constructor(
    @InjectRepository(EmployeeEmergencyContact)
    private readonly contactRepository: Repository<EmployeeEmergencyContact>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeEmergencyContactDto): Promise<EmployeeEmergencyContact> {
    if (dto.isPrimary) {
      await this.resetPrimaryStatus(employeeId);
    }
    const contact = this.contactRepository.create({ ...dto, employeeId });
    return this.contactRepository.save(contact);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeEmergencyContact[]> {
    return this.contactRepository.find({ where: { employeeId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeEmergencyContact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }
    return contact;
  }

  async update(id: string, dto: UpdateEmployeeEmergencyContactDto): Promise<EmployeeEmergencyContact> {
    const contact = await this.findOne(id);
    
    if (dto.isPrimary && !contact.isPrimary) {
      await this.resetPrimaryStatus(contact.employeeId);
    }

    Object.assign(contact, dto);
    return this.contactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
  }

  private async resetPrimaryStatus(employeeId: string): Promise<void> {
    await this.contactRepository.update(
      { employeeId, isPrimary: true },
      { isPrimary: false }
    );
  }
}
