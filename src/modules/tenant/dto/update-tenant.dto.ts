import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '../../../common/enums/tenant-status.enum';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ACME' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Tenant code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'Headquarters tenant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TenantStatus })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
