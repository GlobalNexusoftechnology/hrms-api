import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { BootstrapService } from './services/bootstrap.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SystemController],
  providers: [BootstrapService],
})
export class SystemModule {}
