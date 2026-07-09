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
import { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto';
import { ConvertCandidateDto } from './dto/convert-candidate.dto';
import { EmployeesService } from '../employees/employees.service';
import { InterviewStatusEnum } from 'src/common/enums/interview-status.enum';
import { InterviewRoundEnum } from '../../common/enums/interview-round.enum';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { Designation } from '../designations/entities/designation.entity';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,

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
  ) {}

  async createCandidate(dto: CreateCandidateDto) {
    const existingCandidate = await this.candidateRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingCandidate) {
      throw new BadRequestException('Candidate already exists');
    }

    const duplicateMobile = await this.candidateRepo.findOne({
      where: {
        mobile: dto.mobile,
      },
    });

    if (duplicateMobile) {
      throw new ConflictException('Candidate mobile already exists');
    }

    if (dto.email) {
      const emailExists = await this.employeeRepo.exists({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.mobile) {
      const mobileExists = await this.employeeRepo.exists({
        where: { mobile: dto.mobile },
      });

      if (mobileExists) {
        throw new ConflictException('Mobile already exists');
      }
    }

    const candidate = this.candidateRepo.create(dto);

    return this.candidateRepo.save(candidate);
  }

  async updateCandidate(
    id: string,

    dto: UpdateCandidateDto,
  ) {
    const candidate = await this.candidateRepo.findOne({
      where: {
        id,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const existingEmployee = await this.employeeRepo.findOne({
      where: [
        {
          email: dto.email,
        },
        {
          mobile: dto.mobile,
        },
      ],
    });

    if (existingEmployee)
      throw new ConflictException('EMAIL OR MOBILE IS THERE IN EMPLOYEE TABLE');

    Object.assign(candidate, dto);

    return this.candidateRepo.save(candidate);
  }

  async getCandidates() {
    return this.candidateRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCandidate(id: string) {
    const candidate = await this.candidateRepo.findOne({
      where: {
        id,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async scheduleInterview(dto: ScheduleInterviewDto) {
    const candidate = await this.candidateRepo.findOne({
      where: {
        id: dto.candidateId,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const interviewer = await this.employeeRepo.findOne({
      where: {
        id: dto.interviewerId,
      },
    });

    if (!interviewer) {
      throw new NotFoundException('Interviewer not found');
    }

    if (new Date(dto.scheduledAt) < new Date()) {
      throw new BadRequestException(
        'Interview cannot be scheduled in the past',
      );
    }

    const roundName = dto.roundName;

    if (roundName === InterviewRoundEnum.ASSESSMENT) {
      if (candidate.status !== CandidateStatusEnum.APPLIED && candidate.status !== CandidateStatusEnum.SCREENING) {
        throw new BadRequestException('Candidate must be in APPLIED or SCREENING state to schedule an Assessment.');
      }
    } else if (roundName === InterviewRoundEnum.TECHNICAL) {
      if (candidate.status !== CandidateStatusEnum.ASSESSMENT_CLEARED) {
        throw new BadRequestException('Candidate must clear Assessment before scheduling Technical round.');
      }
    } else if (roundName === InterviewRoundEnum.HR) {
      if (candidate.status !== CandidateStatusEnum.TECHNICAL_CLEARED) {
        throw new BadRequestException('Candidate must clear Technical round before scheduling HR round.');
      }
    }

    const existingInterview = await this.interviewRepo.findOne({
      where: {
        candidateId: dto.candidateId,

        roundName,

        status: InterviewStatusEnum.SCHEDULED,
      },
    });

    if (existingInterview) {
      throw new BadRequestException(
        `Interview round '${roundName}' already exists for this candidate`,
      );
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
      throw new BadRequestException(
        'Interviewer already has another interview scheduled at this time',
      );
    }

    const interview = this.interviewRepo.create({
      ...dto,

      roundName,
    });

    const savedInterview = await this.interviewRepo.save(interview);

    if (roundName === InterviewRoundEnum.ASSESSMENT) {
      candidate.status = CandidateStatusEnum.ASSESSMENT_SCHEDULED;
    } else if (roundName === InterviewRoundEnum.TECHNICAL) {
      candidate.status = CandidateStatusEnum.TECHNICAL_SCHEDULED;
    } else if (roundName === InterviewRoundEnum.HR) {
      candidate.status = CandidateStatusEnum.HR_SCHEDULED;
    }

    await this.candidateRepo.save(candidate);

    return savedInterview;
  }

  async getInterviews() {
    return this.interviewRepo.find({
      relations: {
        candidate: true,

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
      where: {
        id,
      },

      relations: {
        candidate: true,

        interviewer: true,

        feedbacks: {
          creator: true,
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

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
      where: {
        id: interviewId,
      },

      relations: {
        candidate: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.status !== InterviewStatusEnum.SCHEDULED) {
      throw new BadRequestException('Interview is already completed');
    }

    const existingFeedback = await this.feedbackRepo.findOne({
      where: {
        interviewId,
        createdBy: employeeId,
      },
    });

    if (existingFeedback) {
      throw new BadRequestException('Feedback already submitted');
    }

    if (interview.interviewerId !== employeeId) {
      throw new ForbiddenException(
        'Only assigned interviewer can submit feedback',
      );
    }

    const feedback = this.feedbackRepo.create({
      interviewId,

      createdBy: employeeId,

      ...dto,
    });

    await this.feedbackRepo.save(feedback);

    if (dto.recommendation === InterviewRecommendationEnum.SELECT) {
      if (interview.roundName === InterviewRoundEnum.ASSESSMENT) {
        interview.candidate.status = CandidateStatusEnum.ASSESSMENT_CLEARED;
      } else if (interview.roundName === InterviewRoundEnum.TECHNICAL) {
        interview.candidate.status = CandidateStatusEnum.TECHNICAL_CLEARED;
      } else if (interview.roundName === InterviewRoundEnum.HR) {
        interview.candidate.status = CandidateStatusEnum.SELECTED;
      }
    } else if (dto.recommendation === InterviewRecommendationEnum.REJECT) {
      interview.candidate.status = CandidateStatusEnum.REJECTED;
    }

    await this.candidateRepo.save(interview.candidate);

    interview.status = InterviewStatusEnum.COMPLETED;

    await this.interviewRepo.save(interview);

    return {
      success: true,

      message: 'Feedback submitted successfully',

      feedback,
    };
  }

  async updateCandidateStatus(
    candidateId: string,
    dto: UpdateCandidateStatusDto,
  ) {
    const candidate = await this.candidateRepo.findOne({
      where: {
        id: candidateId,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.status === CandidateStatusEnum.HIRED) {
      throw new BadRequestException('Cannot change status of hired candidate');
    }

    const currentStatus = candidate.status;
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

    candidate.status = newStatus;

    return this.candidateRepo.save(candidate);
  }

  async convertToEmployee(candidateId: string, dto: ConvertCandidateDto) {
    const candidate = await this.candidateRepo.findOne({
      where: {
        id: candidateId,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.status !== CandidateStatusEnum.SELECTED) {
      throw new BadRequestException('Only selected candidates can be hired');
    }

    const existingEmployee = await this.employeeRepo.findOne({
      where: {
        email: candidate.email,
      },
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee already exists');
    }

    const existingMobile = await this.employeeRepo.findOne({
      where: {
        mobile: candidate.mobile,
      },
    });

    if (existingMobile) {
      throw new BadRequestException('Employee mobile already exists');
    }

    const role = await this.roleRepo.findOne({
      where: {
        id: dto.roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const department = await this.departmentRepo.findOne({
      where: {
        id: dto.departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const designation = await this.designationRepo.findOne({
      where: {
        id: dto.designationId,
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

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

      departmentId: dto.departmentId,

      designationId: dto.designationId,

      joiningDate: dto.joiningDate,

      employmentType: dto.employmentType,

      isActive: true,
    });

    const savedEmployee = await this.employeeRepo.manager.transaction(async (manager) => {
      const saved = await manager.save(employee);
      candidate.status = CandidateStatusEnum.HIRED;
      await manager.save(candidate);
      return saved;
    });

    return {
      success: true,

      message: 'Candidate converted to employee successfully',

      employee: savedEmployee,
    };
  }
}
