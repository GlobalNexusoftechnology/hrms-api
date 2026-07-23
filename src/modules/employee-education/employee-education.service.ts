import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeEducation } from './entities/employee-education.entity';
import { CreateEmployeeEducationDto } from './dto/create-employee-education.dto';
import { UpdateEmployeeEducationDto } from './dto/update-employee-education.dto';

@Injectable()
export class EmployeeEducationService {
  constructor(
    @InjectRepository(EmployeeEducation)
    private readonly educationRepository: Repository<EmployeeEducation>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeEducationDto): Promise<EmployeeEducation> {
    const education = this.educationRepository.create({ ...dto, employeeId });
    return this.educationRepository.save(education);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeEducation[]> {
    return this.educationRepository.find({ where: { employeeId }, order: { passingYear: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeEducation> {
    const education = await this.educationRepository.findOne({ where: { id } });
    if (!education) {
      throw new NotFoundException('Education record not found');
    }
    return education;
  }

  async update(id: string, dto: UpdateEmployeeEducationDto): Promise<EmployeeEducation> {
    const education = await this.findOne(id);
    Object.assign(education, dto);
    return this.educationRepository.save(education);
  }

  async remove(id: string): Promise<void> {
    const education = await this.findOne(id);
    await this.educationRepository.remove(education);
  }
}
