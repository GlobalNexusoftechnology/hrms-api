import {
  BadRequestException,
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
  ) {}

  async createTeam(dto: CreateTeamDto) {
    const existingTeam = await this.teamRepository.findOne({
      where: {
        name: dto.name,
      },
    });

    if (existingTeam) {
      throw new BadRequestException('Team already exists');
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
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
        },
      });

      if (!employee) {
        throw new NotFoundException('Team lead not found');
      }
    }

    const team = this.teamRepository.create(dto);

    const saved = await this.teamRepository.save(team);

    // Notify Team Lead
    if (saved.teamLeadId) {
      await this.sendTeamNotification(
        [saved.teamLeadId],

        'Team Lead Assigned',

        `You have been assigned as Team Lead of "${saved.name}" team`,

        saved.id,
      );
    }

    return saved;
  }

  async findAll(filterDto: TeamFilterDto) {
    const { search, departmentId, isActive, page = 1, limit = 10 } = filterDto;

    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [teams, total] = await this.teamRepository.findAndCount({
      where,
      relations: {
        department: true,
        teamLead: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: teams,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findOne({
      where: {
        id,
      },
      relations: {
        department: true,
        teamLead: true,
        members: {
          employee: true,
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async assignMembers(dto: AssignTeamMemberDto) {
    const { teamId, employeeIds } = dto;

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const employees = await this.employeeRepository.find({
      where: employeeIds.map((id) => ({ id })),
    });

    if (employees.length !== employeeIds.length) {
      throw new BadRequestException('One or more employees not found');
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

    const members = employeeIdsToAssign.map((employeeId) =>
      this.teamMemberRepository.create({
        teamId,
        employeeId,
      }),
    );

    await this.teamMemberRepository.save(members);

    await this.sendTeamNotification(
      employeeIdsToAssign,

      'Team Assigned',

      `You have been added to "${team.name}" team`,

      team.id,
    );

    return {
      message: 'Members assigned successfully',
    };
  }

  async updateTeam(id: string, dto: UpdateTeamDto) {
    const team = await this.teamRepository.findOne({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (dto.name && dto.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({
        where: {
          name: dto.name,
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
        },
      });

      if (!employee) {
        throw new NotFoundException('Team lead not found');
      }
    }

    Object.assign(team, dto);

    const updated = await this.teamRepository.save(team);

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: team.id,
      },
    });

    await this.sendTeamNotification(
      [
        ...(team.teamLeadId ? [team.teamLeadId] : []),

        ...members.map((member) => member.employeeId),
      ],

      'Team Updated',

      `Team "${team.name}" details have been updated`,

      team.id,
    );

    return updated;
  }

  async removeMember(dto: RemoveTeamMemberDto) {
    const { teamId, employeeId } = dto;

    const team = await this.teamRepository.findOne({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        employeeId,
      },
    });

    if (!member) {
      throw new NotFoundException('Employee not found in this team');
    }

    await this.teamMemberRepository.remove(member);

    await this.sendTeamNotification(
      [employeeId],

      'Removed From Team',

      `You have been removed from "${team.name}" team`,

      team.id,
    );

    return {
      message: 'Member removed successfully',
    };
  }

  async deleteTeam(id: string) {
    const team = await this.teamRepository.findOne({
      where: { id },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: id,
      },
    });

    await this.sendTeamNotification(
      members.map((member) => member.employeeId),

      'Team Deleted',

      `Team "${team.name}" has been deleted`,

      team.id,
    );

    await this.teamRepository.remove(team);

    return {
      message: 'Team deleted successfully',
    };
  }

  async changeTeamLead(teamId: string, dto: ChangeTeamLeadDto) {
    const team = await this.teamRepository.findOne({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const employee = await this.employeeRepository.findOne({
      where: {
        id: dto.teamLeadId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        employeeId: dto.teamLeadId,
      },
    });

    if (!member) {
      throw new BadRequestException('Employee is not part of this team');
    }

    // Save old lead before update
    const oldLeadId = team.teamLeadId;

    // Prevent same lead update
    if (oldLeadId === dto.teamLeadId) {
      throw new BadRequestException('Employee is already the team lead');
    }

    // Update lead
    team.teamLeadId = dto.teamLeadId;

    await this.teamRepository.save(team);

    // Notify old lead
    if (oldLeadId) {
      await this.sendTeamNotification(
        [oldLeadId],

        'Team Lead Removed',

        `You are no longer Team Lead of "${team.name}" team`,

        team.id,
      );
    }

    // Notify new lead
    await this.sendTeamNotification(
      [dto.teamLeadId],

      'Team Lead Assigned',

      `You are now Team Lead of "${team.name}" team`,

      team.id,
    );

    return {
      message: 'Team lead updated successfully',
    };
  }

  async toggleStatus(id: string) {
    const team = await this.teamRepository.findOne({
      where: {
        id,
      },
      select: {
        isActive: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const updatedStatus = !(team.isActive ?? true);

    await this.teamRepository.update(id, {
      isActive: updatedStatus,
    });

    const updatedTeam = await this.teamRepository.findOne({
      where: {
        id,
      },
      select: {
        isActive: true,
      },
    });

    const members = await this.teamMemberRepository.find({
      where: {
        teamId: id,
      },
    });

    await this.sendTeamNotification(
      members.map((member) => member.employeeId),

      updatedStatus ? 'Team Activated' : 'Team Deactivated',

      `Team "${id}" has been ${updatedStatus ? 'activated' : 'deactivated'}`,

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
