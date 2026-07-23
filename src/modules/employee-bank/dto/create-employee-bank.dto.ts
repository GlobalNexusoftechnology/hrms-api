import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateEmployeeBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  accountHolderName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ifsc!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  branchName?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
