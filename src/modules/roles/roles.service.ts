import { Injectable, Logger, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '../activity-log/enums/activity-action.enum';

export interface ActingUser {
  id: string;
  authorityLevel: number;
}

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly activityLogService: ActivityLogService,
  ) { }

  async create(createRoleDto: CreateRoleDto, actingUser: ActingUser) {
    if (createRoleDto.authorityLevel >= actingUser.authorityLevel) {
      throw new ForbiddenException('Cannot create a role with an authority level equal to or greater than your own.');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(createRoleDto.permissionIds) },
    });

    if (permissions.length !== createRoleDto.permissionIds.length) {
      throw new NotFoundException('One or more requested permissions do not exist.');
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      createdByUserId: actingUser.id,
      permissions,
    });

    try {
      const savedRole = await this.roleRepository.save(role);
      await this.activityLogService.logAction({
        userId: actingUser.id,
        module: 'RBAC',
        action: ActivityAction.CREATE,
        description: `Created Role "${savedRole.name}"`,
        entityType: 'Role',
        entityId: savedRole.id,
        newValue: savedRole as unknown as Record<string, any>,
      });
      return savedRole;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`A role with the name '${createRoleDto.name}' already exists.`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.roleRepository.find({
      order: { authorityLevel: 'DESC', name: 'ASC' },
      relations: { permissions: true },
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, actingUser: ActingUser) {
    const role = await this.findOne(id);

    if (role.isProtected) {
      throw new ForbiddenException('Protected roles cannot be modified.');
    }

    if (role.authorityLevel >= actingUser.authorityLevel) {
      throw new ForbiddenException('Cannot modify a role with an authority level equal to or greater than your own.');
    }

    if (updateRoleDto.authorityLevel !== undefined && updateRoleDto.authorityLevel >= actingUser.authorityLevel) {
      throw new ForbiddenException('Cannot escalate a role to an authority level equal to or greater than your own.');
    }

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(updateRoleDto.permissionIds) },
      });
      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new NotFoundException('One or more requested permissions do not exist.');
      }
      role.permissions = permissions;
    }

    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    if (updateRoleDto.authorityLevel !== undefined) role.authorityLevel = updateRoleDto.authorityLevel;
    if (updateRoleDto.dataScope !== undefined) role.dataScope = updateRoleDto.dataScope;
    
    role.updatedByUserId = actingUser.id;

    const savedRole = await this.roleRepository.save(role);
    await this.activityLogService.logAction({
      userId: actingUser.id,
      module: 'RBAC',
      action: ActivityAction.UPDATE,
      description: `Updated Role "${savedRole.name}"`,
      entityType: 'Role',
      entityId: savedRole.id,
      newValue: savedRole as unknown as Record<string, any>,
    });
    return savedRole;
  }

  async remove(id: string, actingUser: ActingUser) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted.');
    }

    if (role.authorityLevel >= actingUser.authorityLevel) {
      throw new ForbiddenException('Cannot delete a role with an authority level equal to or greater than your own.');
    }

    role.deletedAt = new Date();
    role.updatedByUserId = actingUser.id;
    await this.roleRepository.save(role);
    await this.activityLogService.logAction({
      userId: actingUser.id,
      module: 'RBAC',
      action: ActivityAction.DELETE,
      description: `Deleted Role "${role.name}"`,
      entityType: 'Role',
      entityId: role.id,
    });
  }

  async restore(id: string, actingUser: ActingUser) {
    const role = await this.roleRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (!role.deletedAt) {
      throw new ConflictException(`Role with ID ${id} is not deleted`);
    }

    if (role.authorityLevel >= actingUser.authorityLevel) {
      throw new ForbiddenException('Cannot restore a role with an authority level equal to or greater than your own.');
    }

    role.deletedAt = null;
    role.updatedByUserId = actingUser.id;
    
    const savedRole = await this.roleRepository.save(role);
    await this.activityLogService.logAction({
      userId: actingUser.id,
      module: 'RBAC',
      action: ActivityAction.UPDATE,
      description: `Restored Role "${savedRole.name}"`,
      entityType: 'Role',
      entityId: savedRole.id,
    });
    return savedRole;
  }
}
