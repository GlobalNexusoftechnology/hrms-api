import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength, Min, Max } from 'class-validator';

export class CreateEmployeeEducationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  degree!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institution!: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 10)
  passingYear!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  grade?: string;
}
