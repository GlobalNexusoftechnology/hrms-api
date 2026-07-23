import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResignationsController } from './resignations.controller';
import { ResignationsService } from './resignations.service';
import { Resignation } from './entities/resignation.entity';
import { Employee } from '../employees/entities/employee.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resignation, Employee]),
    ActivityLogModule,
  ],
  controllers: [ResignationsController],
  providers: [ResignationsService]
})
export class ResignationsModule {}
