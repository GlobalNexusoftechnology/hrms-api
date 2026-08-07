import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { NotificationType } from '../../../common/enums/NotificationType.enum';

export class CreateNotificationDto {
  @IsUUID()
  employeeId!: string;

  @IsString()
  @MaxLength(150)
  title!: string;

  @IsString()
  message!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
