import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './entities/team-member.entity';
import { Team } from './entities/team.entity';
import { Department } from '../departments/entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamMember,
      Department,
      Employee
    ]),
    NotificationModule , 
  ],

  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
