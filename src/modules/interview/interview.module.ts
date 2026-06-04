import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { Interview } from './entities/interview.entity';
import { InterviewFeedback } from './entities/interview-feedback.entity';
import { Employee } from '../employees/entities/employee.entity';
import { HrInterviewController } from './hr-interview.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      Interview,
      InterviewFeedback,
      Employee,
    ]),
    EmployeesModule
  ],
  controllers: [InterviewController,HrInterviewController,],
  providers: [InterviewService],
})
export class InterviewModule {}
