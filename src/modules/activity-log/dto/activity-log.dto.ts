import { ApiProperty } from '@nestjs/swagger';
import { ActivityAction } from '../enums/activity-action.enum';

export class ActivityLogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  userId?: string;

  @ApiProperty({ nullable: true })
  employeeId?: string;

  @ApiProperty({ nullable: true })
  module?: string;

  @ApiProperty({ enum: ActivityAction })
  action!: ActivityAction;

  @ApiProperty()
  description!: string;

  @ApiProperty({ nullable: true })
  entityType?: string;

  @ApiProperty({ nullable: true })
  entityId?: string;

  @ApiProperty({ nullable: true })
  oldValue?: Record<string, any>;

  @ApiProperty({ nullable: true })
  newValue?: Record<string, any>;

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ nullable: true })
  ipAddress?: string;

  @ApiProperty({ nullable: true })
  userAgent?: string;

  @ApiProperty({ nullable: true })
  requestMethod?: string;

  @ApiProperty({ nullable: true })
  requestPath?: string;

  @ApiProperty({ nullable: true })
  status?: string;

  @ApiProperty({ nullable: true })
  statusCode?: number;

  @ApiProperty({ nullable: true })
  responseTime?: number;

  @ApiProperty({ nullable: true })
  correlationId?: string;

  @ApiProperty()
  createdAt!: Date;
}
