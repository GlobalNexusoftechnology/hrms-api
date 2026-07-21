import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available permissions for role creation' })
  async findAll() {
    return this.permissionsService.findAll();
  }
}
