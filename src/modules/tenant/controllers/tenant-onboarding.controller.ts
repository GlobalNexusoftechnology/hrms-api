import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantOnboardingService } from '../services/tenant-onboarding.service';
import { TenantOnboardingDto } from '../dto/tenant-onboarding.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Tenant Onboarding')
@Controller('onboarding')
export class TenantOnboardingController {
  constructor(
    private readonly tenantOnboardingService: TenantOnboardingService,
  ) {}

  @Post()
  @Public() // Must be public so new customers can sign up
  @ApiOperation({ summary: 'Provision a new SaaS Tenant and Admin User' })
  async onboardTenant(@Body() dto: TenantOnboardingDto) {
    return this.tenantOnboardingService.onboardTenant(dto);
  }
}
