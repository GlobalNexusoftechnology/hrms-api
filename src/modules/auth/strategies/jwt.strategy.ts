import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService, ConfigType } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import jwtConfig from '../../../config/jwt.config';
import { EmployeesService } from 'src/modules/employees/employees.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private configService: ConfigType<typeof jwtConfig>,
    private employeesService: EmployeesService,
    //  configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.secret as string,
      // secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const employee = await this.employeesService.findById(payload.employeeId);

    if (!employee) {
      throw new UnauthorizedException('Unauthorized');
    }

    return employee;
  }
}
