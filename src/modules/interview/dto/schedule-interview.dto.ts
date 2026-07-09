import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { InterviewRoundEnum } from '../../../common/enums/interview-round.enum';

export class ScheduleInterviewDto {
  @IsUUID()
  candidateId!: string;

  @IsUUID()
  interviewerId!: string;

  @IsEnum(InterviewRoundEnum)
  roundName!: InterviewRoundEnum;

  @IsDateString()
  scheduledAt!: Date;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
