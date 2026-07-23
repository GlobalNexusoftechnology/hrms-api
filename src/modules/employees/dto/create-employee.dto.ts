import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import { GenderEnum } from '../../../common/enums/gender.enum';

import { EmploymentTypeEnum } from '../../../common/enums/employment-type.enum';
import { WorkLocationEnum } from '../../../common/enums/work-location.enum';
import { MaritalStatusEnum } from '../../../common/enums/marital-status.enum';
import { EmploymentStatusEnum } from '../../../common/enums/employment-status.enum';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsString()
  mobile!: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsUUID()
  roleId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @IsOptional()
  @IsUUID()
  designationId?: string;

  @IsOptional()
  @IsDateString()
  joiningDate?: Date;

  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType?: EmploymentTypeEnum;

  @IsOptional()
  @IsEnum(EmploymentStatusEnum)
  employmentStatus?: EmploymentStatusEnum;

  @IsOptional()
  @IsEnum(WorkLocationEnum)
  workLocation?: WorkLocationEnum;

  @IsOptional()
  @IsEnum(MaritalStatusEnum)
  maritalStatus?: MaritalStatusEnum;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsString()
  @MinLength(6)
  password!: string;
}
