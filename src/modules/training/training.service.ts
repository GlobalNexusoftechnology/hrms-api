import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { TrainingMaterial } from './entities/training-material.entity';
import { TrainingAssignment } from './entities/training-assignment.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { CreateTrainingMaterialDto } from './dto/create-training-material.dto';
import { TrainingStatusEnum } from '../../common/enums/training-status.enum';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepo: Repository<Training>,

    @InjectRepository(TrainingMaterial)
    private readonly materialRepo: Repository<TrainingMaterial>,

    @InjectRepository(TrainingAssignment)
    private readonly assignmentRepo: Repository<TrainingAssignment>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  private readonly relations = {
    department: true,

    creator: true,

    materials: true,

    assignments: {
      employee: true,
    },
  };

  // =====================
  // CREATE TRAINING
  // =====================

  async create(dto: CreateTrainingDto, createdBy: string) {
    if (dto.departmentId) {
      const department = await this.departmentRepo.findOne({
        where: {
          id: dto.departmentId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    const training = this.trainingRepo.create({
      ...dto,

      createdBy,
    });

    const saved = await this.trainingRepo.save(training);

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateTrainingDto) {
    const training = await this.trainingRepo.findOne({
      where: {
        id,
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    Object.assign(training, dto);

    await this.trainingRepo.save(training);

    return this.findOne(id);
  }

  async findAll() {
    return this.trainingRepo.find({
      relations: this.relations,

      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const training = await this.trainingRepo.findOne({
      where: {
        id,
      },

      relations: this.relations,
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    return training;
  }

  async addMaterial(trainingId: string, dto: CreateTrainingMaterialDto) {
    const training = await this.trainingRepo.findOne({
      where: {
        id: trainingId,
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const material = this.materialRepo.create({
      ...dto,

      trainingId,
    });

    return this.materialRepo.save(material);
  }

  async assignTraining(trainingId: string, employeeIds: string[]) {
    const training = await this.trainingRepo.findOne({
      where: {
        id: trainingId,
      },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const employees = await this.employeeRepo.find({
      where: {
        id: In(employeeIds),
      },
    });

    if (!employees.length) {
      throw new BadRequestException('No employees found');
    }

    const existing = await this.assignmentRepo.find({
      where: {
        trainingId,

        employeeId: In(employeeIds),
      },
    });

    const existingIds = new Set(existing.map((item) => item.employeeId));

    const assignments = employees
      .filter((employee) => !existingIds.has(employee.id))
      .map((employee) =>
        this.assignmentRepo.create({
          trainingId,

          employeeId: employee.id,

          status: TrainingStatusEnum.PENDING,
        }),
      );

    await this.assignmentRepo.save(assignments);

    return {
      success: true,

      assignedCount: assignments.length,
    };
  }

  async getMyTrainings(employeeId: string) {
    return this.assignmentRepo.find({
      where: {
        employeeId,
      },

      relations: {
        training: {
          materials: true,
        },
      },

      order: {
        assignedAt: 'DESC',
      },
    });
  }

  async getTrainingDetails(
    trainingId: string,

    employeeId: string,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: {
        trainingId,
        employeeId,
      },

      relations: {
        training: {
          materials: true,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Training not assigned');
    }

    return assignment;
  }

  async startTraining(
    trainingId: string,

    employeeId: string,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: {
        trainingId,
        employeeId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Training not assigned');
    }

    if (assignment.status === TrainingStatusEnum.PENDING) {
      assignment.status = TrainingStatusEnum.IN_PROGRESS;

      assignment.progressPercentage = 50;

      await this.assignmentRepo.save(assignment);
    }

    return assignment;
  }

  async completeTraining(
    trainingId: string,

    employeeId: string,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: {
        trainingId,
        employeeId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Training not assigned');
    }

    assignment.status = TrainingStatusEnum.COMPLETED;

    assignment.progressPercentage = 100;

    assignment.completedAt = new Date();

    await this.assignmentRepo.save(assignment);

    return assignment;
  }
}
