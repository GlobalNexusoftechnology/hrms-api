import { PartialType } from '@nestjs/swagger';
import { CreateWeekendDto } from './create-weekend_setting.dto';

export class UpdateWeekendSettingDto extends PartialType(CreateWeekendDto) {}
