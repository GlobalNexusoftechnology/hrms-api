import { IsUUID } from 'class-validator';

export class RemoveTeamMemberDto {
  @IsUUID()
  teamId!: string;

  @IsUUID()
  employeeId!: string;
}
