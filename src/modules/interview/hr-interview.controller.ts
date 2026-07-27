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
  ) {
    return this.interviewService.createJobPosting(dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('jobs')
  getJobPostings() {
    return this.interviewService.getJobPostings();
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('jobs/:id')
  getJobPosting(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.interviewService.getJobPosting(id);
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
  getApplications() {
    return this.interviewService.getApplications();
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('applications/:id')
  getApplication(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.interviewService.getApplication(id);
  }

  @Permissions(PermissionEnum.INTERVIEW_UPDATE)
  @Patch('candidates/:id')
  updateCandidate(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: UpdateCandidateDto,
  ) {
    return this.interviewService.updateCandidate(id, dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_UPDATE)
  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: UpdateApplicationStatusDto,
  ) {
    return this.interviewService.updateApplicationStatus(id, dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('applications/:id/convert')
  convertToEmployee(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: ConvertCandidateDto,
  ) {
    return this.interviewService.convertToEmployee(id, dto);
  }

  // ------------------- INTERVIEWS -------------------
  @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('interviews')
  scheduleInterview(
    @Body()
    dto: ScheduleInterviewDto,
  ) {
    return this.interviewService.scheduleInterview(dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('interviews')
  getInterviews() {
    return this.interviewService.getInterviews();
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('interviews/:id')
  getInterview(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.interviewService.getInterview(id);
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
