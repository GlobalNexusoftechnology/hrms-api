import { IsArray, IsUUID } from 'class-validator';

export class SubmitAssessmentDto {
  @IsArray()
  @IsUUID('all', { each: true })
  selectedOptionIds!: string[];
}