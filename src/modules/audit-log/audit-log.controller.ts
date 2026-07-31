import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  // Added @Public() for easy testing via Postman/ThunderClient. Remove if you want it secured.
  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.auditLogService.findAll(query);
  }
}
