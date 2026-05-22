import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { LeaveTypeEnum } from '../../../common/enums/leave-type.enum';

export class CreateLeaveDto {
  @IsEnum(LeaveTypeEnum)
  type!: LeaveTypeEnum;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
