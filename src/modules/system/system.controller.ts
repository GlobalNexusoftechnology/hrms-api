import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BootstrapService } from './services/bootstrap.service';
import { BootstrapSystemDto } from './dto/bootstrap.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Post('bootstrap')
  @Public() // It must be public to run initially when no users exist
  @ApiOperation({ summary: 'One-time initialization of the global system' })
  async bootstrap(@Body() dto: BootstrapSystemDto) {
    return this.bootstrapService.bootstrap(dto);
  }
}
