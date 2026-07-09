import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EmployeesService } from '../employees/employees.service';

import { LoginDto } from './dto/login.dto';

import { RefreshToken } from './entities/refresh-token.entity';
import { MailService } from '../mail/mail.service';

import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';
import { Employee } from '../employees/entities/employee.entity';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailService: MailService,

    private employeesService: EmployeesService,
    private configService: ConfigService,

    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();

    const employee = await this.employeesService.findByIdentifier(identifier);

    // EMPLOYEE NOT FOUND
    if (!employee) {
      const isEmail = identifier.includes('@');

      if (isEmail) {
        throw new UnauthorizedException('Email is not valid');
      }

      throw new UnauthorizedException('Employee code is not valid');
    }

    // INACTIVE ACCOUNT
    if (!employee.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated. Please contact admin',
      );
    }
    // PASSWORD VALIDATION
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      employee.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is not valid');
    }

    await this.employeesService.updateLastLogin(employee.id);

    const payload = {
      sub: employee.id,
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      roleId: employee.roleId,
      passwordVersion: employee.passwordVersion,
    };

    // Access token
    const accessToken = await this.jwtService.signAsync(payload);

    // Refresh config
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    // UNIQUE refresh payload
    const refreshPayload = {
      ...payload,
      jti: randomUUID(),
    };

    // Refresh token
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: refreshSecret!,
      expiresIn: refreshExpiresIn as '7d',
    });

    // Hash token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Revoke previous tokens
    await this.refreshTokenRepository.update(
      {
        employeeId: employee.id,
        isRevoked: false,
      },
      {
        isRevoked: true,
      },
    );

    // Save new refresh token
    await this.refreshTokenRepository.save({
      employeeId: employee.id,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken,

      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        email: employee.email,
        role: employee.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const savedTokens = await this.refreshTokenRepository.find({
        where: {
          employeeId: payload.employeeId,
          isRevoked: false,
        },
      });

      if (!savedTokens.length) {
        throw new UnauthorizedException('Session expired');
      }

      let matchedToken: RefreshToken | null = null;

      for (const token of savedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);

        if (isMatch) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Expiry check
      if (matchedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const employee = await this.employeesService.findById(payload.employeeId);

      if (!employee) {
        throw new UnauthorizedException('Employee not found');
      }

      if (!employee.isActive) {
        throw new ForbiddenException('Your account has been deactivated');
      }

      const newPayload = {
        sub: employee.id,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        roleId: employee.roleId,
        passwordVersion: employee.passwordVersion,
      };

      // Generate access token
      const accessToken = await this.jwtService.signAsync(newPayload);

      // IMPORTANT: unique refresh token
      const refreshPayload = {
        ...newPayload,
        jti: randomUUID(),
      };

      // Generate refresh token
      const newRefreshToken = await this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') as '7d',
      });

      // Revoke old token
      matchedToken.isRevoked = true;

      await this.refreshTokenRepository.save(matchedToken);

      // Save new token
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      await this.refreshTokenRepository.save({
        employeeId: employee.id,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Get active employee tokens
      const tokens = await this.refreshTokenRepository.find({
        where: {
          employeeId: payload.employeeId,
          isRevoked: false,
        },
      });

      if (!tokens.length) {
        throw new UnauthorizedException('Session expired');
      }

      let matchedToken: RefreshToken | null = null;

      // Match token hash
      for (const token of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);

        if (isMatch) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Expiry check
      if (matchedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Revoke token
      matchedToken.isRevoked = true;

      await this.refreshTokenRepository.save(matchedToken);

      return {
        message: 'Logged out successfully',
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // =====================
  // FORGOT PASSWORD
  // =====================

  async forgotPassword(dto: ForgotPasswordDto) {
    const employee = await this.employeeRepository.findOne({
      where: {
        email: dto.email,
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        passwordVersion: true,
      },
    });

    // EMAIL VALIDATION

    if (!employee) {
      throw new BadRequestException('Email does not exist');
    }

    const token = await this.jwtService.signAsync(
      {
        employeeId: employee.id,

        email: employee.email,

        passwordVersion: employee.passwordVersion,

        type: 'RESET_PASSWORD',
      },
      {
        secret: process.env.JWT_RESET_SECRET as string,

        expiresIn: (process.env.JWT_RESET_EXPIRES ?? '15m') as '15m',
      },
    );

    const resetLink = `${process.env.API_URL}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.mailService.sendResetPasswordEmail(
      employee.email,

      employee.firstName,

      resetLink,
    );

    return {
      success: true,

      message: 'Reset password link sent successfully',
    };
  }

  // =====================
  // RESET PASSWORD
  // =====================

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token, {
        secret: process.env.JWT_RESET_SECRET as string,
      });

      // INVALID TOKEN TYPE

      if (payload.type !== 'RESET_PASSWORD') {
        throw new UnauthorizedException('Invalid token');
      }

      const employee = await this.employeeRepository.findOne({
        where: {
          id: payload.employeeId,
        },

        select: {
          id: true,
          password: true,
          passwordVersion: true,
        },
      });

      if (!employee) {
        throw new BadRequestException('Employee not found');
      }

      // TOKEN ALREADY USED

      if (payload.passwordVersion !== employee.passwordVersion) {
        throw new UnauthorizedException('Reset token already used');
      }

      // SAME PASSWORD CHECK

      const isSamePassword = await bcrypt.compare(
        dto.password,
        employee.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password cannot be same as old password',
        );
      }

      // HASH PASSWORD

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      employee.password = hashedPassword;

      employee.passwordVersion += 1;

      await this.employeeRepository.save(employee);

      // INVALIDATE OLD TOKENS
      await this.refreshTokenRepository.update(
        { employeeId: employee.id, isRevoked: false },
        { isRevoked: true },
      );

      return {
        success: true,

        message: 'Password reset successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException('Reset token expired or invalid');
    }
  }
}
