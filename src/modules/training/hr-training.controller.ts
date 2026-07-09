import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseModuleDto } from './dto/create-module.dto';
import { CreateCourseTopicDto } from './dto/create-topic.dto';
import { CreateCourseMaterialDto } from './dto/create-material.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { UpdateCourseDto, UpdateCourseModuleDto, UpdateCourseTopicDto, UpdateCourseMaterialDto } from './dto/update-training.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr/training')
export class HrTrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('course')
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.trainingService.createCourse(dto, user.id);
  }

  @Post('course/:id/module')
  addModule(@Param('id', ParseUUIDPipe) courseId: string, @Body() dto: CreateCourseModuleDto) {
    return this.trainingService.addModule(courseId, dto);
  }

  @Post('module/:id/topic')
  addTopic(@Param('id', ParseUUIDPipe) moduleId: string, @Body() dto: CreateCourseTopicDto) {
    return this.trainingService.addTopic(moduleId, dto);
  }

  @Post('topic/:id/material')
  addMaterial(@Param('id', ParseUUIDPipe) topicId: string, @Body() dto: CreateCourseMaterialDto) {
    return this.trainingService.addMaterial(topicId, dto);
  }

  @Post('module/:id/assessment')
  createAssessment(@Param('id', ParseUUIDPipe) moduleId: string, @Body() dto: CreateAssessmentDto) {
    return this.trainingService.createAssessment(moduleId, dto);
  }

  @Post('course/:id/assign')
  assignCourse(@Param('id', ParseUUIDPipe) courseId: string, @Body() dto: AssignCourseDto) {
    return this.trainingService.assignCourse(courseId, dto);
  }

  @Delete('course/:id/employee/:employeeId')
  unassignCourse(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.trainingService.unassignCourse(courseId, employeeId);
  }

  @Get('course')
  getAllCourses() {
    return this.trainingService.getAllCourses();
  }

  @Get('course/:id')
  getCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getCourseById(id);
  }

  @Get('module/:id')
  getModuleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getModuleById(id);
  }

  @Get('topic/:id')
  getTopicById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getTopicById(id);
  }

  @Get('course/:id/progress')
  getCourseProgress(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getCourseProgress(id);
  }

  @Patch('course/:id')
  updateCourse(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) {
    return this.trainingService.updateCourse(id, dto);
  }

  @Delete('course/:id')
  deleteCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteCourse(id);
  }

  @Patch('module/:id')
  updateModule(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseModuleDto) {
    return this.trainingService.updateModule(id, dto);
  }

  @Delete('module/:id')
  deleteModule(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteModule(id);
  }

  @Patch('topic/:id')
  updateTopic(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseTopicDto) {
    return this.trainingService.updateTopic(id, dto);
  }

  @Delete('topic/:id')
  deleteTopic(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteTopic(id);
  }

  @Patch('material/:id')
  updateMaterial(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseMaterialDto) {
    return this.trainingService.updateMaterial(id, dto);
  }

  @Delete('material/:id')
  deleteMaterial(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteMaterial(id);
  }
}
