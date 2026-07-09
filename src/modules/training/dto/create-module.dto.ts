import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCourseModuleDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  sortOrder!: number;
}