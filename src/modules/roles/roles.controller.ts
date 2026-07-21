import { Controller, Get, Post, Body, Put, Param, Delete, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RolesService, ActingUser } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/entities/employee.entity';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new custom role' })
    async create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.create(createRoleDto, actingUser);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all roles' })
    async findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a role by ID' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a role' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRoleDto, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.update(id, updateRoleDto, actingUser);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a role' })
    async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: Employee) {
        const actingUser: ActingUser = { id: user.id, authorityLevel: user.role?.authorityLevel || 0 };
        return this.rolesService.remove(id, actingUser);
    }
}