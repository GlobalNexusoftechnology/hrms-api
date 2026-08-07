import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsUUID()
  leaveTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
