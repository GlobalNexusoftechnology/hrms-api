import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamFilterDto } from './dto/team-filter.dto';
import { AssignTeamMemberDto } from './dto/assign-team-member.dto';
import { RemoveTeamMemberDto } from './dto/remove-team-member.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ChangeTeamLeadDto } from './dto/change-team-lead.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../common/enums/NotificationType.enum';
import { DataScopeService } from '../../common/services/data-scope.service';
import { DataScopeEnum } from '../../common/enums/data-scope.enum';
import { TenantQueryService } from '../../common/services/tenant-query.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    private readonly notificationService: NotificationService,
    private readonly dataScopeService: DataScopeService,
    private readonly tenantQueryService: TenantQueryService,
  ) {}

  private validateWriteAccess(
    teamBranchId: string | undefined,
    teamDepartmentId: string | undefined,
    currentUser: Employee,
  ) {
    if (!currentUser || !currentUser.role) return;
    const scope = currentUser.role.dataScope;
    if (scope === DataScopeEnum.ORGANIZATION) return;

    if (scope === DataScopeEnum.BRANCH) {
      if (
        currentUser.branchId &&
        teamBranchId &&
        currentUser.branchId !== teamBranchId
      ) {
        throw new ForbiddenException(
          'You do not have permission to modify teams in this branch',
        );
      }
    }
    if (scope === DataScopeEnum.DEPARTMENT) {
      if (
        currentUser.departmentId &&
        teamDepartmentId &&
        currentUser.departmentId !== teamDepartmentId
      ) {
        throw new ForbiddenException(
          'You do not have permission to modify teams in this department',
        );
      }
    }
  }

  async createTeam(dto: CreateTeamDto, currentUser: Employee) {
    if (!dto.branchId && currentUser?.branchId) {
      dto.branchId = currentUser.branchId;
    }

    this.validateWriteAccess(dto.branchId, dto.departmentId, currentUser);
    const existingTeam = await this.teamRepository.findOne({
      where: {
        name: dto.name,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    if (existingTeam) {
      throw new BadRequestException('Team already exists');
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    if (dto.teamLeadId) {
      const employee = await this.employeeRepository.findOne({
        where: {
          id: dto.teamLeadId,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Team lead not found');
      }
    }

    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const team = this.teamRepository.create({
      ...dto,
      tenantId,
    });

    const saved = await this.teamRepository.save(team);

    // Notify Team Lead
    if (saved.teamLeadId) {
      await this.sendTeamNotification(
        [saved.teamLeadId],
        'Team Lead Assigned',
        `You have been assigned as Team Lead of team "${saved.name}".`,
        saved.id,
      );
    }

    return saved;
  }

  async findAll(filterDto: TeamFilterDto, currentUser?: Employee) {
    const { search, departmentId, isActive, page = 1, limit = 10 } = filterDto;

    const qb = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.department', 'department')
      .leftJoinAndSelect('team.teamLead', 'teamLead');

    if (search) {
      qb.andWhere('team.name ILIKE :search', { search: `%${search}%` });
    }

    if (departmentId) {
      qb.andWhere('team.department_id = :departmentId', { departmentId });
    }

    if (isActive !== undefined) {
      qb.andWhere('team.is_active = :isActive', { isActive });
    }

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'team.branchId',
        department: 'team.departmentId',
      });
    }

    this.tenantQueryService.applyTenantFilter(qb, 'team');

    qb.orderBy('team.name', 'ASC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser?: Employee) {
    const qb = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.department', 'department')
      .leftJoinAndSelect('team.teamLead', 'teamLead')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('members.employee', 'employee')
      .where('team.id = :id', { id });

    if (currentUser) {
      this.dataScopeService.applyScope(qb, currentUser, {
        branch: 'team.branchId',
        department: 'team.departmentId',
      });
    }

    this.tenantQueryService.applyTenantFilter(qb, 'team');

    const team = await qb.getOne();

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async assignMembers(dto: AssignTeamMemberDto, currentUser: Employee) {
    const { teamId, employeeIds } = dto;

    const team = await this.teamRepository.findOne({
      where: { id: teamId, tenantId: this.tenantQueryService.getTenantWhereClause().tenantId },
      relations: { teamLead: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.isActive) {
      throw new BadRequestException(
        'Cannot assign members to an inactive team',
      );
    }

    const employees = await this.employeeRepository.find({
      where: employeeIds.map((id) => ({ id, isActive: true })),
    });

    if (employees.length !== employeeIds.length) {
      throw new BadRequestException(
        'One or more employees not found or are inactive',
      );
    }

    if (team.departmentId) {
      const invalidEmployees = employees.filter(
        (emp) => emp.departmentId !== team.departmentId,
      );
      if (invalidEmployees.length > 0) {
        throw new BadRequestException(
          `Employees must belong to the same department as the team. Invalid employees: ${invalidEmployees.map((e) => e.id).join(', ')}`,
        );
      }
    }

    // Only check if employee already exists in SAME team
    const alreadyAssigned = await this.teamMemberRepository.find({
      where: employeeIds.map((employeeId) => ({
        employeeId,
        teamId,
      })),
    });

    const employeeIdsToAssign = employeeIds.filter(
      (employeeId) =>
        !alreadyAssigned.some(
          (item) => item.employeeId === employeeId && item.teamId === teamId,
        ),
    );

    if (!employeeIdsToAssign.length) {
      return {
        message: 'All employees are already members of this team',
      };
    }

    const { tenantId } = this.tenantQueryService.getTenantWhereClause();

    const members = employeeIdsToAssign.map((employeeId) =>
      this.teamMemberRepository.create({
        teamId,
        employeeId,
        tenantId,
      }),
    );

    await this.teamMemberRepository.save(members);

    const leadName = team.teamLead
      ? `${team.teamLead.firstName} ${team.teamLead.lastName}`
      : 'Unassigned';

    await this.sendTeamNotification(
      employeeIdsToAssign,
      'Team Assigned',
      `You have been added to team "${team.name}" (Team Lead: ${leadName}).`,
      team.id,
    );

    return {
      message: 'Members assigned successfully',
    };
  }

  async updateTeam(id: string, dto: UpdateTeamDto, currentUser: Employee) {
    const team = await this.teamRepository.findOne({
      where: { id, tenantId: this.tenantQueryService.getTenantWhereClause().tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    this.validateWriteAccess(team.branchId, team.departmentId, currentUser);
    if (dto.branchId) {
      this.validateWriteAccess(dto.branchId, dto.departmentId, currentUser);
    }

    if (dto.name && dto.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({
        where: {
          name: dto.name,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
        },
      });

      if (existingTeam) {
        throw new BadRequestException('Team name already exists');
      }
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    if (dto.teamLeadId) {
      const employee = await this.employeeRepository.findOne({
        where: {
          id: dto.teamLeadId,
          tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Team lead not found');
      }
    }

    Object.assign(team, dto);

    const updated = await this.teamRepository.save(team);

    const updatedWithRelations = await this.teamRepository.findOne({
      where: { id: team.id, tenantId: this.tenantQueryService.getTenantWhereClause().tenantId },
      relations: { teamLead: true },
    });

    const leadName = updatedWithRelations?.teamLead
      ? `${updatedWithRelations.teamLead.firstName} ${updatedWithRelations.teamLead.lastName}`
      : 'Unassigned';

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: team.id,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    await this.sendTeamNotification(
      [
        ...(updatedWithRelations?.teamLeadId ? [updatedWithRelations.teamLeadId] : []),
        ...members.map((member) => member.employeeId),
      ],
      'Team Updated',
      `Team "${updatedWithRelations?.name || team.name}" details have been updated (Team Lead: ${leadName}).`,
      team.id,
    );

    return updated;
  }

  async removeMember(dto: RemoveTeamMemberDto, currentUser: Employee) {
    const { teamId, employeeId } = dto;

    const team = await this.teamRepository.findOne({
      where: {
        id: teamId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
      relations: { teamLead: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    this.validateWriteAccess(team.branchId, team.departmentId, currentUser);

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        employeeId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Employee not found in this team');
    }

    await this.teamMemberRepository.remove(member);

    const leadName = team.teamLead
      ? `${team.teamLead.firstName} ${team.teamLead.lastName}`
      : 'Unassigned';

    await this.sendTeamNotification(
      [employeeId],
      'Removed From Team',
      `You have been removed from team "${team.name}" (Team Lead: ${leadName}).`,
      team.id,
    );

    return {
      message: 'Member removed successfully',
    };
  }

  async deleteTeam(id: string, currentUser: Employee) {
    const team = await this.teamRepository.findOne({
      where: { id, tenantId: this.tenantQueryService.getTenantWhereClause().tenantId },
      relations: { teamLead: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    this.validateWriteAccess(team.branchId, team.departmentId, currentUser);

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: id,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    const leadName = team.teamLead
      ? `${team.teamLead.firstName} ${team.teamLead.lastName}`
      : 'Unassigned';

    await this.sendTeamNotification(
      [
        ...(team.teamLeadId ? [team.teamLeadId] : []),
        ...members.map((member) => member.employeeId),
      ],
      'Team Deleted',
      `Team "${team.name}" (Team Lead: ${leadName}) has been deleted.`,
      team.id,
    );

    await this.teamRepository.remove(team);

    return {
      message: 'Team deleted successfully',
    };
  }

  async changeTeamLead(
    teamId: string,
    dto: ChangeTeamLeadDto,
    currentUser: Employee,
  ) {
    const team = await this.teamRepository.findOne({
      where: {
        id: teamId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    this.validateWriteAccess(team.branchId, team.departmentId, currentUser);

    const employee = await this.employeeRepository.findOne({
      where: {
        id: dto.teamLeadId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        employeeId: dto.teamLeadId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    if (!member) {
      throw new BadRequestException('Employee is not part of this team');
    }

    const oldLeadId = team.teamLeadId;

    if (oldLeadId === dto.teamLeadId) {
      throw new BadRequestException('Employee is already the team lead');
    }

    team.teamLeadId = dto.teamLeadId;

    await this.teamRepository.save(team);

    const newLeadName = `${employee.firstName} ${employee.lastName}`;
    const members = await this.teamMemberRepository.find({
      where: {
        teamId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    // Notify old lead
    if (oldLeadId) {
      await this.sendTeamNotification(
        [oldLeadId],
        'Team Lead Role Changed',
        `You are no longer Team Lead of team "${team.name}". ${newLeadName} has taken over as Team Lead.`,
        team.id,
      );
    }

    // Notify new lead
    await this.sendTeamNotification(
      [dto.teamLeadId],
      'Team Lead Assigned',
      `You are now official Team Lead of team "${team.name}".`,
      team.id,
    );

    // Notify all team members
    const memberIdsToNotify = members
      .map((m) => m.employeeId)
      .filter((id) => id !== dto.teamLeadId && id !== oldLeadId);

    if (memberIdsToNotify.length > 0) {
      await this.sendTeamNotification(
        memberIdsToNotify,
        'New Team Lead Assigned',
        `${newLeadName} has been assigned as the new Team Lead for team "${team.name}".`,
        team.id,
      );
    }

    return {
      message: 'Team lead updated successfully',
    };
  }

  async toggleStatus(id: string, currentUser: Employee) {
    const team = await this.teamRepository.findOne({
      where: {
        id,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
      relations: { teamLead: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    this.validateWriteAccess(team.branchId, team.departmentId, currentUser);

    const updatedStatus = !(team.isActive ?? true);

    await this.teamRepository.update(id, {
      isActive: updatedStatus,
    });

    const updatedTeam = await this.teamRepository.findOne({
      where: {
        id,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
      relations: { teamLead: true },
    });

    const leadName = updatedTeam?.teamLead
      ? `${updatedTeam.teamLead.firstName} ${updatedTeam.teamLead.lastName}`
      : 'Unassigned';

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: id,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
    });

    await this.sendTeamNotification(
      [
        ...(updatedTeam?.teamLeadId ? [updatedTeam.teamLeadId] : []),
        ...members.map((member) => member.employeeId),
      ],
      updatedStatus ? 'Team Activated' : 'Team Deactivated',
      `Team "${updatedTeam?.name || team.name}" (Team Lead: ${leadName}) has been ${updatedStatus ? 'activated' : 'deactivated'}.`,
      id,
    );

    return {
      message: `Team ${updatedStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: updatedTeam?.isActive,
    };
  }

  async getMyTeam(employeeId: string) {
    const teamMember = await this.teamMemberRepository.findOne({
      where: {
        employeeId,
        tenantId: this.tenantQueryService.getTenantWhereClause().tenantId,
      },
      relations: {
        team: {
          department: true,
          teamLead: true,
          members: {
            employee: true,
          },
        },
      },
    });

    if (!teamMember) {
      throw new NotFoundException('You are not assigned to any team');
    }

    const team = teamMember.team;

    return {
      teamId: team.id,

      teamName: team.name,

      description: team.description,

      department: team.department,

      teamLead: team.teamLead,

      totalMembers: team.members?.length || 0,

      members:
        team.members?.map((member) => ({
          id: member.employee.id,

          employeeCode: member.employee.employeeCode,

          name: `${member.employee.firstName} ${member.employee.lastName}`,
        })) || [],
    };
  }

  private async sendTeamNotification(
    employeeIds: string[],

    title: string,

    message: string,

    teamId?: string,
  ) {
    const uniqueEmployeeIds = [...new Set(employeeIds)];

    await Promise.all(
      uniqueEmployeeIds.map((employeeId) =>
        this.notificationService.createNotification({
          employeeId,

          title,

          message,

          type: NotificationType.TEAM,

          referenceId: teamId,
        }),
      ),
    );
  }
}
