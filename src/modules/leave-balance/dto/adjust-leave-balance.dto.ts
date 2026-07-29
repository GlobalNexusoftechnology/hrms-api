import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AdjustLeaveBalanceDto {
  @IsNotEmpty()
  @IsUUID()
  employeeId!: string;

  @IsNotEmpty()
  @IsUUID()
  leaveTypeId!: string;

  @IsNotEmpty()
  @IsNumber()
  days!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
