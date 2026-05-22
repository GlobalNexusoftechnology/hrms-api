import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsUUID()
  departmentId!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
