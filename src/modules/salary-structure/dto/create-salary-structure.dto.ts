import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateSalaryStructureDto {
  @IsUUID()
  employeeId!: string;

  @IsNumber()
  @Min(0)
  basicSalary!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pf?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esic?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsDateString()
  effectiveFrom!: string;
}
