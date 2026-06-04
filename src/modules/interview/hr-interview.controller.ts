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
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPER_ADMIN, RoleEnum.HR)
@Controller('hr')
export class HrInterviewController {
  constructor(private readonly interviewService: InterviewService) {}

 @Permissions(PermissionEnum.INTERVIEW_CREATE)
  @Post('candidates')
  createCandidate(
    @Body()
    dto: CreateCandidateDto,
  ) {
    return this.interviewService.createCandidate(dto);
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('candidates')
  getCandidates() {
    return this.interviewService.getCandidates();
  }

  @Permissions(PermissionEnum.INTERVIEW_READ)
  @Get('candidates/:id')
  getCandidate(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.interviewService.getCandidate(id);
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
  @Patch('candidates/:id/status')
  updateCandidateStatus(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateCandidateStatusDto,
  ) {
    return this.interviewService.updateCandidateStatus(id, dto);
  }

@Permissions(PermissionEnum.INTERVIEW_CREATE)
@Post('candidates/:id/convert')
convertToEmployee(
  @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    dto: ConvertCandidateDto,
  ) {
    return this.interviewService.convertToEmployee(id, dto);
  }


  
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
