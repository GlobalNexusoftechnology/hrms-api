import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { InterviewRecommendationEnum } from '../../../common/enums/interview-recommendation.enum';

export class InterviewFeedbackDto {
  @IsNumber()
  rating!: number;

  @IsNumber()
  technicalScore!: number;

  @IsNumber()
  communicationScore!: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsEnum(InterviewRecommendationEnum)
  recommendation!: InterviewRecommendationEnum;
}
