import { Controller, Get, Query } from '@nestjs/common';
import { AuthLogService } from './auth-log.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/entities/employee.entity';

@Controller('auth-logs')
export class AuthLogController {
  constructor(private readonly authLogService: AuthLogService) {}

  @Permissions(PermissionEnum.AUTH_LOG_READ)
  @Get()
  findAll(@Query() query: any, @CurrentUser() currentUser: Employee) {
    return this.authLogService.findAll(query, currentUser);
  }
}
