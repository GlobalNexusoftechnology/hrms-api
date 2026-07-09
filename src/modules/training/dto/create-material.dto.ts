import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { TrainingMaterialTypeEnum } from '../../../common/enums/training-material-type.enum';

export class CreateCourseMaterialDto {
  @IsString()
  title!: string;

  @IsEnum(TrainingMaterialTypeEnum)
  type!: TrainingMaterialTypeEnum;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsNumber()
  sortOrder!: number;
}