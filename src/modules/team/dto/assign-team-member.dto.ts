import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
} from 'class-validator';

export class AssignTeamMemberDto {
  @IsUUID()
  teamId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
  })
  employeeIds!: string[];
}