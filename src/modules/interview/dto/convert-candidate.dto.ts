import { IsDateString, IsEnum, IsUUID } from 'class-validator';

import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';

export class ConvertCandidateDto {
  @IsUUID()
  roleId!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  designationId!: string;

  @IsDateString()
  joiningDate!: Date;

  @IsEnum(EmploymentTypeEnum)
  employmentType!: EmploymentTypeEnum;
}
