import {
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComponentOverrideDto {
  @IsUUID()
  componentId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overrideAmount?: number;
}

export class CreateSalaryStructureDto {
  @IsUUID()
  employeeId!: string;

  @IsNumber()
  @Min(0)
  basicSalary!: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentOverrideDto)
  components!: ComponentOverrideDto[];
}
