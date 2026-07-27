import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class EncashLeaveDto {
  @IsNotEmpty()
  @IsUUID()
  leaveTypeId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  days!: number;

  @IsString()
  reason?: string;
}
