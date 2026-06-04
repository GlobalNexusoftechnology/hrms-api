import { IsEnum } from 'class-validator';

import { CandidateStatusEnum } from '../../../common/enums/candidate-status.enum';

export class UpdateCandidateStatusDto {
  @IsEnum(CandidateStatusEnum)
  status!: CandidateStatusEnum;
}
