import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DesignationsService } from './designations.service';

import { DesignationsController } from './designations.controller';

import { Designation } from './entities/designation.entity';

import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Designation, Department])],

  controllers: [DesignationsController],

  providers: [DesignationsService],

  exports: [DesignationsService],
})
export class DesignationsModule {}
