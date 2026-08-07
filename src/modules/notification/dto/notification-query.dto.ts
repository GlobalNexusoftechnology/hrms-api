import { Type } from 'class-transformer';

import { IsBooleanString, IsNumber, IsOptional, Min } from 'class-validator';

export class NotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}
