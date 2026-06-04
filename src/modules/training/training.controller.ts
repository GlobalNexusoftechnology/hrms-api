import {
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { Request } from 'express';

import { Permissions } from '../auth/decorators/permissions.decorator';

import { PermissionEnum } from '../../common/enums/permission.enum';

import { TrainingService } from './training.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}


  @Permissions(PermissionEnum.TRAINING_READ)
  @Get('me')
  getMyTrainings(
    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.trainingService.getMyTrainings(req.user.id);
  }
  

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.TRAINING_READ)
  @Get(':id')
  getTrainingDetails(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.trainingService.getTrainingDetails(id, req.user.id);
  }


  @Permissions(PermissionEnum.TRAINING_UPDATE)
  @Patch(':id/start')
  startTraining(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.trainingService.startTraining(id, req.user.id);
  }

  @Permissions(PermissionEnum.TRAINING_UPDATE)
  @Patch(':id/complete')
  completeTraining(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Req()
    req: Request & {
      user: any;
    },
  ) {
    return this.trainingService.completeTraining(id, req.user.id);
  }
}
