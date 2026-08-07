import {
  IsBooleanString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentTypeEnum } from 'src/common/enums/employment-type.enum';
import { GenderEnum } from 'src/common/enums/gender.enum';

export class GetEmployeesDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designationId?: string;

  @ApiPropertyOptional({ enum: GenderEnum })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiPropertyOptional({ enum: EmploymentTypeEnum })
  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType?: EmploymentTypeEnum;
}
