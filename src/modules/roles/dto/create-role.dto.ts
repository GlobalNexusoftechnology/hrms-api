import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsArray, ArrayNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_AUTHORITY_LEVEL, MIN_AUTHORITY_LEVEL } from '../constants/role.constants';
import { DataScopeEnum } from '../../../common/enums/data-scope.enum';

export class CreateRoleDto {
  @ApiProperty({ example: 'HR Manager', description: 'Name of the custom role' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Can manage employees and leaves', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 70, description: 'Higher value = Higher authority. Users can only create/manage roles with strictly lower authority levels.' })
  @IsInt()
  @Min(MIN_AUTHORITY_LEVEL)
  @Max(MAX_AUTHORITY_LEVEL)
  authorityLevel!: number;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Array of Permission UUIDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  permissionIds!: string[];

  @ApiProperty({ example: 'SELF', description: 'Data scope for the role', enum: DataScopeEnum, required: false })
  @IsOptional()
  @IsEnum(DataScopeEnum)
  dataScope?: DataScopeEnum;
}
