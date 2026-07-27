import { IsDateString, IsUUID } from 'class-validator';

export class ConvertCandidateDto {
  @IsUUID()
  roleId!: string;

  @IsUUID()
  designationId!: string;

  @IsDateString()
  joiningDate!: Date;
}
