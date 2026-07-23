import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CareerMovementsService } from './career-movements.service';
import { CreateCareerMovementDto } from './dto/create-career-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

@ApiTags('Career Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees/:employeeId/career-movements')
export class CareerMovementsController {
  constructor(private readonly careerMovementsService: CareerMovementsService) {}

  @Post()
  @Permissions(PermissionEnum.CAREER_MOVEMENT_CREATE)
  @ApiOperation({ summary: 'Request a career movement (Promotion, Demotion, etc.)' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() createDto: CreateCareerMovementDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.careerMovementsService.create(employeeId, createDto, user.id, req.correlationId);
  }

  @Get()
  @Permissions(PermissionEnum.CAREER_MOVEMENT_READ)
  @ApiOperation({ summary: 'Get all career movements for an employee' })
  findAll(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.careerMovementsService.findAll(employeeId);
  }

  @Get(':id')
  @Permissions(PermissionEnum.CAREER_MOVEMENT_READ)
  @ApiOperation({ summary: 'Get a specific career movement' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.careerMovementsService.findOne(id);
  }

  @Patch(':id/approve')
  @Permissions(PermissionEnum.CAREER_MOVEMENT_APPROVE)
  @ApiOperation({ summary: 'Approve a pending career movement' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.careerMovementsService.approve(id, user.id, req.correlationId);
  }

  @Patch(':id/execute')
  @Permissions(PermissionEnum.CAREER_MOVEMENT_EXECUTE)
  @ApiOperation({ summary: 'Execute an approved career movement' })
  execute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.careerMovementsService.execute(id, user.id, req.correlationId);
  }
}
