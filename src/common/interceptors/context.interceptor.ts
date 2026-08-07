import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Set HTTP context immediately — available before guards run
    this.cls.set('ipAddress', request.ip);
    this.cls.set('endpoint', request.originalUrl || request.url);
    this.cls.set('method', request.method);

    // Parse user agent into human-readable labels (not the raw 300-char string)
    const userAgent = request.headers['user-agent'] || '';
    this.cls.set('browser', this.getBrowser(userAgent));
    this.cls.set('os', this.getOS(userAgent));
    this.cls.set('device', this.getDevice(userAgent));

    // NOTE: request.user is populated by Passport middleware BEFORE interceptors
    // run, so it IS available here on authenticated routes.
    const user = request.user;
    if (user) {
      this.cls.set('userId', user.id || user.employeeId || user.sub);
      this.cls.set('roleId', user.roleId);
      this.cls.set('branchId', user.branchId);
      this.cls.set('sessionId', user.sessionId);
    }

    return next.handle();
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'Mac OS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDevice(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) return 'Mobile';
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'Tablet';
    return 'Desktop';
  }
}
