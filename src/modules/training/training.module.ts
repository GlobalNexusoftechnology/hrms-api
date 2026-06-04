import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingController } from './training.controller';

import { TrainingService } from './training.service';

import { Training } from './entities/training.entity';

import { TrainingMaterial } from './entities/training-material.entity';

import { TrainingAssignment } from './entities/training-assignment.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Department } from '../departments/entities/department.entity';
import { HrTrainingController } from './hr-training.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Training,
      TrainingMaterial,
      TrainingAssignment,
      Employee,
      Department,
    ]),
  ],

  controllers: [TrainingController, HrTrainingController],

  providers: [TrainingService],

  exports: [TrainingService],
})
export class TrainingModule {}
