import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('me')
  getMyCourses(@CurrentUser() user: any) {
    return this.trainingService.getMyCourses(user.id);
  }

  @Get('course/:id')
  getCourseDetails(@Param('id', ParseUUIDPipe) courseId: string, @CurrentUser() user: any) {
    return this.trainingService.getCourseDetails(courseId, user.id);
  }

  @Patch('topic/:id/complete')
  completeTopic(@Param('id', ParseUUIDPipe) topicId: string, @CurrentUser() user: any) {
    return this.trainingService.completeTopic(topicId, user.id);
  }

  @Post('module/:id/assessment/submit')
  submitAssessment(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @Body() dto: SubmitAssessmentDto,
    @CurrentUser() user: any,
  ) {
    return this.trainingService.submitAssessment(moduleId, user.id, dto);
  }
}
