import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from '../tenant.service';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { UpdateTenantStatusDto } from '../dto/update-tenant-status.dto';
import { TenantFilterDto } from '../dto/tenant-filter.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of all SaaS tenants with filters' })
  async findAll(@Query() filterDto: TenantFilterDto) {
    return this.tenantService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant metadata' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update tenant status (ACTIVE, SUSPENDED, INACTIVE)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.tenantService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a tenant' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.remove(id);
  }
}
