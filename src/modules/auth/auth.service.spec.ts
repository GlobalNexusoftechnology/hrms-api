import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { EmployeesService } from '../employees/employees.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-token'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: any;
  let mailService: any;
  let employeesService: any;
  let configService: any;
  let employeeRepository: any;
  let refreshTokenRepository: any;
  let localEmployee: any;

  const mockEmployeeTemplate = {
    id: 'emp-123',
    employeeCode: 'EMP-001',
    email: 'john@example.com',
    password: 'hashed-password',
    isActive: true,
    roleId: 'role-1',
    role: 'admin',
    passwordVersion: 1,
    firstName: 'John',
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  });

  beforeEach(async () => {
    // Create a fresh clone of the employee template for each test to avoid state mutation leaks
    localEmployee = { ...mockEmployeeTemplate };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
            verifyAsync: jest.fn().mockResolvedValue({
              employeeId: 'emp-123',
              passwordVersion: 1,
              type: 'RESET_PASSWORD',
            }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: EmployeesService,
          useValue: {
            findByIdentifier: jest
              .fn()
              .mockImplementation(() => Promise.resolve(localEmployee)),
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
            findById: jest
              .fn()
              .mockImplementation(() => Promise.resolve(localEmployee)),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
              if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
              return null;
            }),
          },
        },
        {
          provide: getRepositoryToken(Employee),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    employeesService = module.get<EmployeesService>(EmployeesService);
    configService = module.get<ConfigService>(ConfigService);
    employeeRepository = module.get(getRepositoryToken(Employee));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'john@example.com ',
      password: 'Password123',
    };

    it('should successfully log in and return tokens', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      refreshTokenRepository.update.mockResolvedValue({ affected: 1 });
      refreshTokenRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        refreshToken: 'jwt-token',
        employee: {
          id: 'emp-123',
          employeeCode: 'EMP-001',
          email: 'john@example.com',
          role: 'admin',
        },
      });
      expect(employeesService.findByIdentifier).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(employeesService.updateLastLogin).toHaveBeenCalledWith('emp-123');
    });

    it('should throw UnauthorizedException if employee code/email not found', async () => {
      employeesService.findByIdentifier.mockResolvedValueOnce(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is deactivated', async () => {
      localEmployee.isActive = false;
      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if password compare fails', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should verify token, revoke old sessions, and return new access token', async () => {
      const mockSavedToken = {
        tokenHash: 'hashed-ref-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isRevoked: false,
      };

      refreshTokenRepository.find.mockResolvedValueOnce([mockSavedToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      refreshTokenRepository.save.mockResolvedValue({});

      const result = await service.refreshToken('ref-token');
      expect(result).toHaveProperty('accessToken');
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no matching token session found', async () => {
      refreshTokenRepository.find.mockResolvedValueOnce([]);
      await expect(service.refreshToken('ref-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke matching token successfully', async () => {
      const mockSavedToken = {
        tokenHash: 'hashed-ref-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isRevoked: false,
      };

      refreshTokenRepository.find.mockResolvedValueOnce([mockSavedToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      refreshTokenRepository.save.mockResolvedValue({});

      const result = await service.logout('ref-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockSavedToken.isRevoked).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email if employee exists', async () => {
      employeeRepository.findOne.mockResolvedValueOnce(localEmployee);
      const result = await service.forgotPassword({
        email: 'john@example.com',
      });
      expect(result).toEqual({
        success: true,
        message: 'Reset password link sent successfully',
      });
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email does not exist', async () => {
      employeeRepository.findOne.mockResolvedValueOnce(null);
      await expect(
        service.forgotPassword({ email: 'unknown@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const resetDto = { token: 'reset-token', password: 'newPassword123' };

    it('should reset password, hashing new value and incrementing version', async () => {
      employeeRepository.findOne.mockResolvedValueOnce(localEmployee);
      // Mock same password compare as false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      employeeRepository.save.mockResolvedValue({});

      const result = await service.resetPassword(resetDto);
      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully',
      });
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if new password matches old password', async () => {
      employeeRepository.findOne.mockResolvedValueOnce(localEmployee);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
