import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RoleEnum } from '../../common/enums/role.enum';
import { CreateTrainingDto } from './dto/create-training.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateTrainingMaterialDto } from './dto/create-training-material.dto';
import { AssignTrainingDto } from './dto/assign-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hr/training')
export class HrTrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Permissions(PermissionEnum.TRAINING_CREATE)
  @Post()
  create(
    @Body() dto: CreateTrainingDto,
    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.trainingService.create(dto, req.user.id);
  }

  @Permissions(PermissionEnum.TRAINING_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateTrainingDto,
  ) {
    return this.trainingService.update(id, dto);
  }

  @Permissions(PermissionEnum.TRAINING_READ)
  @Get()
  findAll() {
    return this.trainingService.findAll();
  }

  @Permissions(PermissionEnum.TRAINING_READ)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.trainingService.findOne(id);
  }

  @Permissions(PermissionEnum.TRAINING_UPDATE)
  @Post(':id/material')
  addMaterial(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: CreateTrainingMaterialDto,
  ) {
    return this.trainingService.addMaterial(id, dto);
  }

  @Permissions(PermissionEnum.TRAINING_UPDATE)
  @Post(':id/assign')
  assignTraining(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: AssignTrainingDto,
  ) {
    return this.trainingService.assignTraining(id, dto.employeeIds);
  }
}
