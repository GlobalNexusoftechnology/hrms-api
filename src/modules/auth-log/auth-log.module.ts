import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthLog } from './entities/auth-log.entity';
import { AuthLogService } from './auth-log.service';
import { AuthLogController } from './auth-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuthLog])],
  controllers: [AuthLogController],
  providers: [AuthLogService],
  exports: [AuthLogService],
})
export class AuthLogModule {}
