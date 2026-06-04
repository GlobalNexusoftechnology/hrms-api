import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignTrainingDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
  })
  employeeIds!: string[];
}
