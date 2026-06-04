import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

import { TrainingMaterialTypeEnum } from '../../../common/enums/training-material-type.enum';

export class CreateTrainingMaterialDto {
  @IsString()
  title!: string;

  @IsEnum(TrainingMaterialTypeEnum)
  type!: TrainingMaterialTypeEnum;

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}
