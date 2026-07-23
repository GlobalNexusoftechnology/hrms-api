import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResignationsService } from './resignations.service';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';

@ApiTags('Resignations & Exits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resignations')
export class ResignationsController {
  constructor(private readonly resignationsService: ResignationsService) {}

  @Post('employees/:employeeId')
  @Permissions(PermissionEnum.RESIGNATION_CREATE)
  @ApiOperation({ summary: 'Submit a new resignation request' })
  create(
    @Param('employeeId', ParseUUIDPipe) employeeId: string, 
    @Body() dto: CreateResignationDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.resignationsService.create(employeeId, dto, user.id, req.correlationId);
  }

  @Get()
  @Permissions(PermissionEnum.RESIGNATION_READ)
  @ApiOperation({ summary: 'View all resignations in the system' })
  findAll() {
    return this.resignationsService.findAll();
  }

  @Get('employees/:employeeId')
  @Permissions(PermissionEnum.RESIGNATION_READ)
  @ApiOperation({ summary: 'View resignations for a specific employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.resignationsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Permissions(PermissionEnum.RESIGNATION_READ)
  @ApiOperation({ summary: 'View a specific resignation' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.resignationsService.findOne(id);
  }

  @Patch(':id/approve')
  @Permissions(PermissionEnum.RESIGNATION_APPROVE)
  @ApiOperation({ summary: 'Approve a resignation request and start notice period' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.resignationsService.approve(id, user.id, req.correlationId);
  }

  @Patch(':id/execute')
  @Permissions(PermissionEnum.RESIGNATION_EXECUTE)
  @ApiOperation({ summary: 'Execute the final exit and deactivate employee' })
  execute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.resignationsService.execute(id, user.id, req.correlationId);
  }
}
