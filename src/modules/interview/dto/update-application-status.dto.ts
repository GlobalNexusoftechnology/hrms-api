import { IsEnum } from 'class-validator';
import { CandidateStatusEnum } from '../../../common/enums/candidate-status.enum';

export class UpdateApplicationStatusDto {
  @IsEnum(CandidateStatusEnum)
  status!: CandidateStatusEnum;
}
