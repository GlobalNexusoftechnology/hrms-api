import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeExperience } from './entities/employee-experience.entity';
import { CreateEmployeeExperienceDto } from './dto/create-employee-experience.dto';
import { UpdateEmployeeExperienceDto } from './dto/update-employee-experience.dto';

@Injectable()
export class EmployeeExperienceService {
  constructor(
    @InjectRepository(EmployeeExperience)
    private readonly experienceRepository: Repository<EmployeeExperience>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeExperienceDto): Promise<EmployeeExperience> {
    const experience = this.experienceRepository.create({ ...dto, employeeId });
    return this.experienceRepository.save(experience);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeExperience[]> {
    return this.experienceRepository.find({ where: { employeeId }, order: { fromDate: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeExperience> {
    const experience = await this.experienceRepository.findOne({ where: { id } });
    if (!experience) {
      throw new NotFoundException('Experience record not found');
    }
    return experience;
  }

  async update(id: string, dto: UpdateEmployeeExperienceDto): Promise<EmployeeExperience> {
    const experience = await this.findOne(id);
    Object.assign(experience, dto);
    return this.experienceRepository.save(experience);
  }

  async remove(id: string): Promise<void> {
    const experience = await this.findOne(id);
    await this.experienceRepository.remove(experience);
  }
}
