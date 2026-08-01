import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { InterviewFeedbackDto } from './dto/interview-feedback.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConvertCandidateDto } from './dto/convert-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr')
export class HrInterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  // ------------------- JOB POSTINGS -------------------
  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('jobs')
  createJobPosting(
    @Body()
    dto: CreateJobPostingDto,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.createJobPosting(dto, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('jobs')
  getJobPostings(@CurrentUser() user: any) {
    return this.interviewService.getJobPostings(user);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('jobs/:id')
  getJobPosting(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.getJobPosting(id, user);
  }

  // ------------------- APPLICATIONS -------------------
  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('applications')
  createApplication(
    @Body()
    dto: CreateCandidateDto,
  ) {
    return this.interviewService.applyToJob(dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('applications')
  getApplications(@CurrentUser() user: any) {
    return this.interviewService.getApplications(user);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('applications/:id')
  getApplication(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.getApplication(id, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_UPDATE)
  @Patch('applications/:id')
  updateCandidate(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: UpdateCandidateDto,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.updateCandidate(id, dto, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_UPDATE)
  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: UpdateApplicationStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.updateApplicationStatus(id, dto, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('applications/:id/convert')
  convertToEmployee(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: ConvertCandidateDto,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.convertToEmployee(id, dto, user);
  }

  // ------------------- INTERVIEWS -------------------
  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('interviews')
  scheduleInterview(
    @Body()
    dto: ScheduleInterviewDto,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.scheduleInterview(dto, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('interviews')
  getInterviews(@CurrentUser() user: any) {
    return this.interviewService.getInterviews(user);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('interviews/:id')
  getInterview(
    @Param('id', ParseUUIDPipe)
    id: string,
    @CurrentUser() user: any,
  ) {
    return this.interviewService.getInterview(id, user);
  }

  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('interviews/:id/feedback')
  addFeedback(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: InterviewFeedbackDto,
    @CurrentUser()
    user: any,
  ) {
    return this.interviewService.addFeedback(id, dto, user.id);
  }
}
