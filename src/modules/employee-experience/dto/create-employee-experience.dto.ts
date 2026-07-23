import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateEmployeeExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  designation!: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate!: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  reasonForLeaving?: string;
}
