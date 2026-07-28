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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@UseGuards(JwtAuthGuard)
@Controller('leave-ledger')
export class LeaveLedgerController {
  constructor(private readonly leaveLedgerService: LeaveLedgerService) {}

  @Permissions(PermissionEnum.LEAVE_LEDGER_READ)
  @Get('my-ledger')
  findMyLedger(
    @CurrentUser() employee: any,
    @Query('year') year?: number,
  ) {
    return this.leaveLedgerService.findAllByEmployee(employee.id, year);
  }

  @Permissions(PermissionEnum.LEAVE_LEDGER_READ)
  @Get('employee/:employeeId')
  findByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.leaveLedgerService.findAllByEmployee(employeeId, year);
  }

  @Permissions(PermissionEnum.LEAVE_LEDGER_READ)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveLedgerService.findOne(id);
  }
}
