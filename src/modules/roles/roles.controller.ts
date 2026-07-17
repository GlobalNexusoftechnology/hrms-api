import { Controller, Get } from '@nestjs/common';

import { RolesService } from './roles.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Public()
    @Get()
    async findAll() {
        return this.rolesService.findAll();
    }
}