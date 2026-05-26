import { PartialType } from '@nestjs/mapped-types';

import { CreateSalaryStructureDto } from './create-salary-structure.dto';

export class UpdateSalaryStructureDto extends PartialType(
  CreateSalaryStructureDto,
) {}
