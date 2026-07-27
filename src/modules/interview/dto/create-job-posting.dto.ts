import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';

export class CreateJobPostingDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  requirements!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  branchId!: string;

  @IsEnum(EmploymentTypeEnum)
  employmentType!: EmploymentTypeEnum;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;
}
