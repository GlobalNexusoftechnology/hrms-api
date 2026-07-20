import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  task?: boolean;

  @IsOptional()
  @IsBoolean()
  leave?: boolean;

  @IsOptional()
  @IsBoolean()
  attendance?: boolean;

  @IsOptional()
  @IsBoolean()
  payroll?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;

  @IsOptional()
  @IsBoolean()
  team?: boolean;

  @IsOptional()
  @IsBoolean()
  standup?: boolean;

  @IsOptional()
  @IsBoolean()
  holiday?: boolean;

  @IsOptional()
  @IsBoolean()
  training?: boolean;

  @IsOptional()
  @IsBoolean()
  interview?: boolean;

  @IsOptional()
  @IsBoolean()
  announcement?: boolean;
}
