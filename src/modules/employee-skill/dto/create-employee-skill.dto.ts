import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength, IsEnum, Min, Max } from 'class-validator';
import { ProficiencyLevelEnum } from '../../../common/enums/proficiency-level.enum';

export class CreateEmployeeSkillDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  skillName!: string;

  @IsEnum(ProficiencyLevelEnum)
  @IsNotEmpty()
  proficiencyLevel!: ProficiencyLevelEnum;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  certificationDetails?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 10)
  year?: number;
}
