import { IsUUID } from 'class-validator';

export class ChangeTeamLeadDto {
  @IsUUID()
  teamLeadId!: string;
}
