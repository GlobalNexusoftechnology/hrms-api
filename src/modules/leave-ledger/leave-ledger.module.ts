import { Module } from '@nestjs/common';
import { LeaveLedgerService } from './leave-ledger.service';
import { LeaveLedgerController } from './leave-ledger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveLedger } from './entities/leave-ledger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveLedger])],
  controllers: [LeaveLedgerController],
  providers: [LeaveLedgerService],
  exports: [LeaveLedgerService],
})
export class LeaveLedgerModule {}
