import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EmployeesService } from '../employees/employees.service';

import { LoginDto } from './dto/login.dto';

import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    private employeesService: EmployeesService,
    private configService: ConfigService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    const employee = await this.employeesService.findByIdentifier(
      dto.identifier,
    );

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      employee.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: employee.id,
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      roleId: employee.roleId,
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

      const newPayload = {
        sub: employee.id,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        roleId: employee.roleId,
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
}
