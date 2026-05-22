import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDesignationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
