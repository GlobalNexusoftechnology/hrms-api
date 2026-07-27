import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository, Between } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { Interview } from './entities/interview.entity';
import { InterviewFeedback } from './entities/interview-feedback.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateStatusEnum } from '../../common/enums/candidate-status.enum';
import { InterviewRecommendationEnum } from '../../common/enums/interview-recommendation.enum';
import { InterviewFeedbackDto } from './dto/interview-feedback.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ConvertCandidateDto } from './dto/convert-candidate.dto';
import { EmployeesService } from '../employees/employees.service';
import { InterviewStatusEnum } from 'src/common/enums/interview-status.enum';
import { InterviewRoundEnum } from '../../common/enums/interview-round.enum';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';
import { JobPosting } from './entities/job-posting.entity';
import { CandidateApplication } from './entities/candidate-application.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../common/enums/NotificationType.enum';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,

    @InjectRepository(CandidateApplication)
    private readonly applicationRepo: Repository<CandidateApplication>,

    @InjectRepository(JobPosting)
    private readonly jobRepo: Repository<JobPosting>,

    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,

    @InjectRepository(InterviewFeedback)
    private readonly feedbackRepo: Repository<InterviewFeedback>,

    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,

    private employeeService: EmployeesService,
    private readonly notificationService: NotificationService,
  ) {}

  // ------------------- JOB POSTINGS -------------------
  async createJobPosting(dto: CreateJobPostingDto) {
    const job = this.jobRepo.create(dto);
    return this.jobRepo.save(job);
  }

  async getJobPostings() {
    return this.jobRepo.find({
      order: { createdAt: 'DESC' },
      relations: { department: true, branch: true },
    });
  }

  async getJobPosting(id: string) {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: { department: true, branch: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  // ------------------- APPLICATIONS -------------------
  async applyToJob(dto: CreateCandidateDto) {
    const job = await this.jobRepo.findOne({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job posting not found');

    // 1. Validate if Email or Mobile exists in Employee records
    const employeeExists = await this.employeeRepo.findOne({
      where: [{ email: dto.email }, { mobile: dto.mobile }],
    });
    if (employeeExists) {
      throw new ConflictException('This email or mobile number already exists in the Employee records.');
    }

    // 2. Find or Create Candidate (can apply to multiple jobs)
    let candidate = await this.candidateRepo.findOne({
      where: [{ email: dto.email }, { mobile: dto.mobile }] 
    });
    
    if (!candidate) {
      candidate = this.candidateRepo.create(dto);
      candidate = await this.candidateRepo.save(candidate);
    } else {
      Object.assign(candidate, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        mobile: dto.mobile,
        resumeUrl: dto.resumeUrl || candidate.resumeUrl,
        experience: dto.experience || candidate.experience,
        currentCompany: dto.currentCompany || candidate.currentCompany,
        currentCtc: dto.currentCtc || candidate.currentCtc,
        expectedCtc: dto.expectedCtc || candidate.expectedCtc,
        noticePeriod: dto.noticePeriod || candidate.noticePeriod,
        skills: dto.skills || candidate.skills,
        source: dto.source || candidate.source,
      });
      candidate = await this.candidateRepo.save(candidate);
    }

    // 3. Validate if Candidate already applied to this specific Job
    const existingApp = await this.applicationRepo.findOne({
      where: { candidateId: candidate.id, jobId: job.id }
    });

    if (existingApp) {
      throw new ConflictException('You have already applied for this specific job posting.');
    }

    // 4. Create Application
    const application = this.applicationRepo.create({
      candidateId: candidate.id,
      jobId: job.id,
    });

    return this.applicationRepo.save(application);
  }

  async getApplications() {
    return this.applicationRepo.find({
      order: { createdAt: 'DESC' },
      relations: { candidate: true, job: true },
    });
  }

  async getApplication(id: string) {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: { candidate: true, job: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async updateCandidate(candidateId: string, dto: UpdateCandidateDto) {
    const candidate = await this.candidateRepo.findOne({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    if (dto.email || dto.mobile) {
      const existingEmployee = await this.employeeRepo.findOne({
        where: [{ email: dto.email }, { mobile: dto.mobile }],
      });
      if (existingEmployee) throw new ConflictException('Email or mobile already in use by employee');
    }

    Object.assign(candidate, dto);
    return this.candidateRepo.save(candidate);
  }

  // ------------------- INTERVIEWS -------------------
  async scheduleInterview(dto: ScheduleInterviewDto) {
    const application = await this.applicationRepo.findOne({
      where: { id: dto.applicationId },
      relations: { candidate: true, job: true }
    });

    if (!application) throw new NotFoundException('Application not found');

    const interviewer = await this.employeeRepo.findOne({
      where: { id: dto.interviewerId },
    });

    if (!interviewer) throw new NotFoundException('Interviewer not found');

    if (new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException('Interview cannot be scheduled in the past');
    }

    const roundName = dto.roundName;

    if (roundName === InterviewRoundEnum.ASSESSMENT) {
      if (application.status !== CandidateStatusEnum.APPLIED && application.status !== CandidateStatusEnum.SCREENING) {
        throw new BadRequestException('Candidate must be in APPLIED or SCREENING state to schedule an Assessment.');
      }
    } else if (roundName === InterviewRoundEnum.TECHNICAL) {
      if (application.status !== CandidateStatusEnum.ASSESSMENT_CLEARED) {
        throw new BadRequestException('Candidate must clear Assessment before scheduling Technical round.');
      }
    } else if (roundName === InterviewRoundEnum.HR) {
      if (application.status !== CandidateStatusEnum.TECHNICAL_CLEARED) {
        throw new BadRequestException('Candidate must clear Technical round before scheduling HR round.');
      }
    }

    const existingInterview = await this.interviewRepo.findOne({
      where: {
        applicationId: dto.applicationId,
        roundName,
        status: InterviewStatusEnum.SCHEDULED,
      },
    });

    if (existingInterview) {
      throw new BadRequestException(`Interview round '${roundName}' already exists for this application`);
    }

    const scheduledDate = new Date(dto.scheduledAt);
    const windowStart = new Date(scheduledDate.getTime() - 59 * 60000);
    const windowEnd = new Date(scheduledDate.getTime() + 59 * 60000);

    const interviewerBusy = await this.interviewRepo.findOne({
      where: {
        interviewerId: dto.interviewerId,
        scheduledAt: Between(windowStart, windowEnd),
        status: InterviewStatusEnum.SCHEDULED,
      },
    });

    if (interviewerBusy) {
      throw new BadRequestException('Interviewer already has another interview scheduled at this time');
    }

    const interview = this.interviewRepo.create({
      ...dto,
      roundName,
    });

    const savedInterview = await this.interviewRepo.save(interview);

    // Send Notification to Interviewer
    await this.notificationService.createNotification({
      employeeId: dto.interviewerId,
      type: NotificationType.INTERVIEW,
      title: `Interview Scheduled: ${roundName}`,
      message: `An interview has been scheduled with candidate ${application.candidate.firstName} ${application.candidate.lastName} on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()} for the ${application.job.title} position.`,
      referenceId: savedInterview.id,
    });

    if (roundName === InterviewRoundEnum.ASSESSMENT) {
      application.status = CandidateStatusEnum.ASSESSMENT_SCHEDULED;
    } else if (roundName === InterviewRoundEnum.TECHNICAL) {
      application.status = CandidateStatusEnum.TECHNICAL_SCHEDULED;
    } else if (roundName === InterviewRoundEnum.HR) {
      application.status = CandidateStatusEnum.HR_SCHEDULED;
    }

    await this.applicationRepo.save(application);

    return savedInterview;
  }

  async getInterviews() {
    return this.interviewRepo.find({
      relations: {
        application: { candidate: true, job: true },
        interviewer: true,
        feedbacks: true,
      },
      order: {
        scheduledAt: 'DESC',
      },
    });
  }

  async getInterview(id: string) {
    const interview = await this.interviewRepo.findOne({
      where: { id },
      relations: {
        application: { candidate: true, job: true },
        interviewer: true,
        feedbacks: { creator: true },
      },
    });

    if (!interview) throw new NotFoundException('Interview not found');

    return {
      interview,
      feedbackCount: interview.feedbacks.length,
      isCompleted: interview.status === InterviewStatusEnum.COMPLETED,
    };
  }

  async addFeedback(
    interviewId: string,
    dto: InterviewFeedbackDto,
    employeeId: string,
  ) {
    const interview = await this.interviewRepo.findOne({
      where: { id: interviewId },
      relations: { application: true },
    });

    if (!interview) throw new NotFoundException('Interview not found');
    if (interview.status !== InterviewStatusEnum.SCHEDULED) throw new BadRequestException('Interview is already completed');

    const existingFeedback = await this.feedbackRepo.findOne({
      where: { interviewId, createdBy: employeeId },
    });
    if (existingFeedback) throw new BadRequestException('Feedback already submitted');
    if (interview.interviewerId !== employeeId) throw new ForbiddenException('Only assigned interviewer can submit feedback');

    const feedback = this.feedbackRepo.create({
      interviewId,
      createdBy: employeeId,
      ...dto,
    });

    await this.feedbackRepo.save(feedback);

    if (dto.recommendation === InterviewRecommendationEnum.SELECT) {
      if (interview.roundName === InterviewRoundEnum.ASSESSMENT) {
        interview.application.status = CandidateStatusEnum.ASSESSMENT_CLEARED;
      } else if (interview.roundName === InterviewRoundEnum.TECHNICAL) {
        interview.application.status = CandidateStatusEnum.TECHNICAL_CLEARED;
      } else if (interview.roundName === InterviewRoundEnum.HR) {
        interview.application.status = CandidateStatusEnum.SELECTED;
      }
    } else if (dto.recommendation === InterviewRecommendationEnum.REJECT) {
      interview.application.status = CandidateStatusEnum.REJECTED;
    }

    await this.applicationRepo.save(interview.application);
    interview.status = InterviewStatusEnum.COMPLETED;
    await this.interviewRepo.save(interview);

    return {
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    };
  }

  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.status === CandidateStatusEnum.HIRED) throw new BadRequestException('Cannot change status of hired candidate');

    const currentStatus = application.status;
    const newStatus = dto.status;

    if (newStatus === CandidateStatusEnum.ASSESSMENT_CLEARED && currentStatus !== CandidateStatusEnum.ASSESSMENT_SCHEDULED) {
      throw new BadRequestException('Candidate must be in ASSESSMENT_SCHEDULED state before being marked as ASSESSMENT_CLEARED');
    }
    if (newStatus === CandidateStatusEnum.TECHNICAL_CLEARED && currentStatus !== CandidateStatusEnum.TECHNICAL_SCHEDULED) {
      throw new BadRequestException('Candidate must be in TECHNICAL_SCHEDULED state before being marked as TECHNICAL_CLEARED');
    }
    if (newStatus === CandidateStatusEnum.SELECTED && currentStatus !== CandidateStatusEnum.HR_SCHEDULED) {
      throw new BadRequestException('Candidate must be in HR_SCHEDULED state before being marked as SELECTED');
    }

    application.status = newStatus;
    return this.applicationRepo.save(application);
  }

  async convertToEmployee(applicationId: string, dto: ConvertCandidateDto) {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: { candidate: true, job: true },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== CandidateStatusEnum.SELECTED) throw new BadRequestException('Only selected candidates can be hired');

    const candidate = application.candidate;
    const job = application.job;

    const existingEmployee = await this.employeeRepo.findOne({
      where: [{ email: candidate.email }, { mobile: candidate.mobile }]
    });

    if (existingEmployee) throw new BadRequestException('Employee already exists with this email or mobile');

    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const designation = await this.designationRepo.findOne({ where: { id: dto.designationId } });
    if (!designation) throw new NotFoundException('Designation not found');

    const password = await bcrypt.hash('123456', 10);
    const employeeCode = await this.employeeService.generateEmployeeCode();

    const employee = this.employeeRepo.create({
      employeeCode,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      mobile: candidate.mobile,
      password,
      roleId: dto.roleId,
      departmentId: job.departmentId,
      branchId: job.branchId,
      designationId: dto.designationId,
      joiningDate: dto.joiningDate,
      employmentType: job.employmentType,
      isActive: true,
    });

    const savedEmployee = await this.employeeRepo.manager.transaction(async (manager) => {
      const saved = await manager.save(employee);
      application.status = CandidateStatusEnum.HIRED;
      await manager.save(application);
      return saved;
    });

    return {
      success: true,
      message: 'Candidate converted to employee successfully',
      employee: savedEmployee,
    };
  }
}
