import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
