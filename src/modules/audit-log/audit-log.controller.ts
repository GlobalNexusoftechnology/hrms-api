import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/entities/employee.entity';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Permissions(PermissionEnum.AUDIT_LOG_READ)
  @Get()
  findAll(@Query() query: any, @CurrentUser() currentUser: Employee) {
    return this.auditLogService.findAll(query, currentUser);
  }
}
