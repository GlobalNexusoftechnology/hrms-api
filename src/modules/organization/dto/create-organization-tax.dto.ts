import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationTaxDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pan!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  msme?: string;
}
