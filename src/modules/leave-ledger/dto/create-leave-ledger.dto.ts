import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { LeaveTransactionType } from '../entities/leave-ledger.entity';

export class CreateLeaveLedgerDto {
  @IsNotEmpty()
  @IsUUID()
  employeeId!: string;

  @IsNotEmpty()
  @IsUUID()
  leaveTypeId!: string;

  @IsNotEmpty()
  @IsEnum(LeaveTransactionType)
  transactionType!: LeaveTransactionType;

  @IsNotEmpty()
  @IsNumber()
  days!: number;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
