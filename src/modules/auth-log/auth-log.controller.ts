import { Controller, Get, Query } from '@nestjs/common';
import { AuthLogService } from './auth-log.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('auth-logs')
export class AuthLogController {
  constructor(private readonly authLogService: AuthLogService) {}

  // Added @Public() for easy testing via Postman/ThunderClient. Remove if you want it secured.
  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.authLogService.findAll(query);
  }
}
