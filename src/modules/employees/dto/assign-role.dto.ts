import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsUUID()
  roleId!: string;
}
