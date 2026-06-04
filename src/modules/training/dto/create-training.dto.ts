import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { TrainingTypeEnum } from '../../../common/enums/training-type.enum';

export class CreateTrainingDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TrainingTypeEnum)
  type!: TrainingTypeEnum;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
