import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamFilterDto } from './dto/team-filter.dto';
import { AssignTeamMemberDto } from './dto/assign-team-member.dto';
import { RemoveTeamMemberDto } from './dto/remove-team-member.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ChangeTeamLeadDto } from './dto/change-team-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from '../../common/enums/permission.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  
  @Permissions(PermissionEnum.TEAM_CREATE)
  @Post()
  async create(
    @Body()
    dto: CreateTeamDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.createTeam(dto, employee);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.TEAM_READ)
  @Post('assign-members')
  async assignMembers(
    @Body()
    dto: AssignTeamMemberDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.assignMembers(dto, employee);
  }

  @Permissions(PermissionEnum.TEAM_READ)
  @Get('my-team')
  async getMyTeam(@Req() req: any) {
    return this.teamService.getMyTeam(req.user.id);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.TEAM_READ)
  @Get()
  async findAll(
    @Query()
    query: TeamFilterDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.findAll(query, employee);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
  @Permissions(PermissionEnum.TEAM_READ)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.findOne(id, employee);
  }

  
  @Permissions(PermissionEnum.TEAM_UPDATE)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateTeamDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.updateTeam(id, dto, employee);
  }

  
  @Permissions(PermissionEnum.TEAM_DELETE)
  @Delete('remove-member')
  async removeMember(
    @Body()
    dto: RemoveTeamMemberDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.removeMember(dto, employee);
  }

  
  @Permissions(PermissionEnum.TEAM_DELETE)
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.deleteTeam(id, employee);
  }

  
  @Permissions(PermissionEnum.TEAM_UPDATE)
  @Patch('change-lead/:teamId')
  async changeLead(
    @Param('teamId', ParseUUIDPipe)
    teamId: string,

    @Body()
    dto: ChangeTeamLeadDto,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.changeTeamLead(teamId, dto, employee);
  }

  
  @Permissions(PermissionEnum.TEAM_UPDATE)
  @Patch('toggle-status/:id')
  async toggleStatus(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() employee: any,
  ) {
    return this.teamService.toggleStatus(id, employee);
  }
}
