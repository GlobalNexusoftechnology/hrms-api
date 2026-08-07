import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePayrollDto {
  @IsUUID()
  employeeId!: string;

  @IsNumber()
  month!: number;

  @IsNumber()
  year!: number;

  @IsOptional()
  @IsNumber()
  bonusAmount?: number;

  @IsOptional()
  @IsString()
  bonusReason?: string;

  @IsOptional()
  @IsNumber()
  deductionAmount?: number;

  @IsOptional()
  @IsString()
  deductionReason?: string;
}
