import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { CreateCourseModuleDto } from './create-module.dto';
import { CreateCourseTopicDto } from './create-topic.dto';
import { CreateCourseMaterialDto } from './create-material.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
export class UpdateCourseModuleDto extends PartialType(CreateCourseModuleDto) {}
export class UpdateCourseTopicDto extends PartialType(CreateCourseTopicDto) {}
export class UpdateCourseMaterialDto extends PartialType(CreateCourseMaterialDto) {}
