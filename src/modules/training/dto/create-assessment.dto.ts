import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class AssessmentOptionDto {
  @IsString()
  optionText!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsNumber()
  sortOrder!: number;
}

class AssessmentQuestionDto {
  @IsString()
  questionText!: string;

  @IsNumber()
  sortOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentOptionDto)
  options!: AssessmentOptionDto[];
}

export class CreateAssessmentDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  passingPercentage?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentQuestionDto)
  questions!: AssessmentQuestionDto[];
}