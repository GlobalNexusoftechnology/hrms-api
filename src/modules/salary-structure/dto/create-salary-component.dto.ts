import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { SalaryComponentTypeEnum } from '../../../common/enums/salary-component-type.enum';
import { CalculationTypeEnum } from '../../../common/enums/calculation-type.enum';
import { PercentageBaseEnum } from '../../../common/enums/percentage-base.enum';

export class CreateSalaryComponentDto {

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsEnum(SalaryComponentTypeEnum)
  type!: SalaryComponentTypeEnum;

  @IsEnum(CalculationTypeEnum)
  calculationType!: CalculationTypeEnum;

  @IsNumber()
  @Min(0)
  defaultAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentageValue?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  allowOverride?: boolean;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isProratable?: boolean;

  @IsOptional()
  @IsEnum(PercentageBaseEnum)
  percentageBase?: PercentageBaseEnum;
}
