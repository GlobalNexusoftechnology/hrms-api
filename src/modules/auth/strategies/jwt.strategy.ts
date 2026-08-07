import { Inject, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import jwtConfig from '../../../config/jwt.config';
import { EmployeesService } from '../../employees/employees.service';
import { JwtPayload } from '../types/jwt-payload.type';
import { TenantService } from '../../tenant/tenant.service';
import { ClsService } from 'nestjs-cls';
import { TenantStatus } from '../../../common/enums/tenant-status.enum';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private configService: ConfigType<typeof jwtConfig>,
    private employeesService: EmployeesService,
    private tenantService: TenantService,
    private cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.secret as string,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.employeeId || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token or missing tenantId');
    }

    const employee = await this.employeesService.findByIdForAuth(payload.employeeId);
    if (!employee) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!employee.isActive) {
      throw new ForbiddenException('Account deactivated');
    }

    // Platform tenant validation bypass
    if (payload.tenantId !== '00000000-0000-0000-0000-000000000000') {
      const tenant = await this.tenantService.findById(payload.tenantId);
      if (!tenant) {
        throw new UnauthorizedException('Tenant not found');
      }

      if (tenant.status === TenantStatus.SUSPENDED) {
        throw new ForbiddenException('Tenant Suspended');
      }
      if (tenant.status === TenantStatus.INACTIVE) {
        throw new ForbiddenException('Tenant Inactive');
      }
    }

    // Make sure employee belongs to the token's tenant
    if (employee.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    const context: TenantContext = {
      tenantId: payload.tenantId,
      userId: employee.id,
      roleId: employee.roleId,
      sessionId: payload.sessionId,
    };

    this.cls.set('tenantContext', context);

    return employee;
  }
}
