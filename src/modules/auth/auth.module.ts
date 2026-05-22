import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { RefreshToken } from './entities/refresh-token.entity';

import { EmployeesModule } from '../employees/employees.module';

import jwtConfig from '../../config/jwt.config';

import { AccessTokenStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,

    ConfigModule.forFeature(jwtConfig),

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    EmployeesModule,

    TypeOrmModule.forFeature([RefreshToken]),

    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],

  controllers: [AuthController],

  providers: [AuthService, AccessTokenStrategy],

  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
