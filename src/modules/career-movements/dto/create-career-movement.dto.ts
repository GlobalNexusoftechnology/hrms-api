import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { CareerMovementTypeEnum } from '../../../common/enums/career-movement-type.enum';

export class CreateCareerMovementDto {
  @IsEnum(CareerMovementTypeEnum)
  movementType!: CareerMovementTypeEnum;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsUUID()
  newBranchId?: string;

  @IsOptional()
  @IsUUID()
  newDepartmentId?: string;

  @IsOptional()
  @IsUUID()
  newDesignationId?: string;

  @IsOptional()
  @IsUUID()
  newRoleId?: string;

  @IsOptional()
  @IsUUID()
  newShiftId?: string;

  @IsOptional()
  @IsUUID()
  newSalaryStructureId?: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsUUID()
  attachmentDocumentId?: string;

  @IsOptional()
  @IsBoolean()
  impactPayroll?: boolean;

  @IsOptional()
  @IsBoolean()
  impactPermissions?: boolean;
}
