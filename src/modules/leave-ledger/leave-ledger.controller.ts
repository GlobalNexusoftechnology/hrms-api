import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeaveLedgerService } from './leave-ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('leave-ledger')
export class LeaveLedgerController {
  constructor(private readonly leaveLedgerService: LeaveLedgerService) {}

  @Get('my-ledger')
  findMyLedger(
    @CurrentUser() employee: any,
    @Query('year') year?: number,
  ) {
    return this.leaveLedgerService.findAllByEmployee(employee.id, year);
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.leaveLedgerService.findAllByEmployee(employeeId, year);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveLedgerService.findOne(id);
  }
}
