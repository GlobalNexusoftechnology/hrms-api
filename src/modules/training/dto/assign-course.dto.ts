import { IsArray, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class AssignCourseDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  employeeIds?: string[];

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}