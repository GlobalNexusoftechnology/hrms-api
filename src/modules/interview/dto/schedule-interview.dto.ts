import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ScheduleInterviewDto {
  @IsUUID()
  candidateId!: string;

  @IsUUID()
  interviewerId!: string;

  @IsString()
  roundName!: string;

  @IsDateString()
  scheduledAt!: Date;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
