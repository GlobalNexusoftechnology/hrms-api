import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';

@Injectable()
export class EmployeeSkillService {
  constructor(
    @InjectRepository(EmployeeSkill)
    private readonly skillRepository: Repository<EmployeeSkill>,
  ) {}

  async create(employeeId: string, dto: CreateEmployeeSkillDto): Promise<EmployeeSkill> {
    const skill = this.skillRepository.create({ ...dto, employeeId });
    return this.skillRepository.save(skill);
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeSkill[]> {
    return this.skillRepository.find({ where: { employeeId }, order: { year: 'DESC' } });
  }

  async findOne(id: string): Promise<EmployeeSkill> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async update(id: string, dto: UpdateEmployeeSkillDto): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    Object.assign(skill, dto);
    return this.skillRepository.save(skill);
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id);
    await this.skillRepository.remove(skill);
  }
}
