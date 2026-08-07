import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveLedgerDto } from './create-leave-ledger.dto';

export class UpdateLeaveLedgerDto extends PartialType(CreateLeaveLedgerDto) {}
