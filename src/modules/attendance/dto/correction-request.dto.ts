import { IsString, IsOptional } from 'class-validator';

export class CorrectionRequestDto {
  @IsString()
  date!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  requestedCheckIn?: string;

  @IsOptional()
  requestedCheckOut?: string;
}
