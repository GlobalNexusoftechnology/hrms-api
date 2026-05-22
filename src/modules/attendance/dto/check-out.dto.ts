import { IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  earlyCheckoutReason?: string;
}
