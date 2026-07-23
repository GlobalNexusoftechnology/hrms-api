import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeFamily } from './entities/employee-family.entity';
import { CreateEmployeeFamilyDto } from './dto/create-employee-family.dto';
import { UpdateEmployeeFamilyDto } from './dto/update-employee-family.dto';

@Injectable()
export class EmployeeFamilyService {
  constructor(
    @InjectRepository(EmployeeFamily)
    private readonly familyRepository: Repository<EmployeeFamily>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeFamilyDto): Promise<EmployeeFamily> {
    const familyMember = this.familyRepository.create({ ...dto, employeeId });
    return this.familyRepository.save(familyMember);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeFamily[]> {
    return this.familyRepository.find({ where: { employeeId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeFamily> {
    const familyMember = await this.familyRepository.findOne({ where: { id } });
    if (!familyMember) {
      throw new NotFoundException('Family member not found');
    }
    return familyMember;
  }

  async update(id: string, dto: UpdateEmployeeFamilyDto): Promise<EmployeeFamily> {
    const familyMember = await this.findOne(id);
    Object.assign(familyMember, dto);
    return this.familyRepository.save(familyMember);
  }

  async remove(id: string): Promise<void> {
    const familyMember = await this.findOne(id);
    await this.familyRepository.remove(familyMember);
  }
}
