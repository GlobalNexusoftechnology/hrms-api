import { Controller, Get, Post, Body, Put, Param, Delete, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RolesService, ActingUser } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/entities/employee.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { PermissionEnum } from './../../common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Permissions(PermissionEnum.ROLE_CREATE)
    @Post()
    @ApiOperation({ summary: 'Create a new custom role' })
    async create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.create(createRoleDto, actingUser);
    }

    @Permissions(PermissionEnum.ROLE_READ)
    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    async findAll() {
        return this.rolesService.findAll();
    }

    @Permissions(PermissionEnum.ROLE_READ)
    @Get(':id')
    @ApiOperation({ summary: 'Get a role by ID' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.rolesService.findOne(id);
    }

    @Permissions(PermissionEnum.ROLE_UPDATE)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a role' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRoleDto, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.update(id, updateRoleDto, actingUser);
    }

    @Permissions(PermissionEnum.ROLE_DELETE)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a role' })
    async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.remove(id, actingUser);
    }

    @Permissions(PermissionEnum.ROLE_CREATE)
    @Post(':id/restore')
    @ApiOperation({ summary: 'Restore a deleted role' })
    async restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.restore(id, actingUser);
    }
}