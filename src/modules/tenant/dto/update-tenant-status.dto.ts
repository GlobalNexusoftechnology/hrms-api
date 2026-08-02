import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus } from '../../../common/enums/tenant-status.enum';

export class UpdateTenantStatusDto {
  @ApiProperty({ enum: TenantStatus, example: TenantStatus.ACTIVE })
  @IsNotEmpty()
  @IsEnum(TenantStatus)
  status!: TenantStatus;
}
