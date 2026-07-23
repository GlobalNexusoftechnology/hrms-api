import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ActivityLogService } from '../../modules/activity-log/activity-log.service';
import { ActivityAction } from '../../modules/activity-log/enums/activity-action.enum';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    // Skip GET, OPTIONS, HEAD, and specific paths
    const skipMethods = ['GET', 'OPTIONS', 'HEAD'];
    const skipPaths = ['/health', '/metrics', '/api/docs', '/activity-log'];
    
    if (skipMethods.includes(req.method) || skipPaths.some(p => req.url.includes(p))) {
      return next.handle();
    }

    // Assign correlationId to request object for downstream business services
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.log(req, res, startTime, 'SUCCESS'),
        error: (err) => this.log(req, res, startTime, 'ERROR', err.status || 500)
      })
    );
  }

  private log(req: any, res: any, startTime: number, status: string, errorStatusCode?: number) {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const url = req.originalUrl || req.url;
    
    let action = ActivityAction.UPDATE;
    if (method === 'POST') action = ActivityAction.CREATE;
    else if (method === 'PUT' || method === 'PATCH') action = ActivityAction.UPDATE;
    else if (method === 'DELETE') action = ActivityAction.DELETE;

    this.activityLogService.logAction({
      userId: req.user?.id || null, // Populated by AuthGuard
      module: 'API Request', 
      action: action,
      description: `Executed ${method} ${url}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestMethod: method,
      requestPath: url,
      status: status,
      statusCode: errorStatusCode || res.statusCode,
      responseTime: responseTime,
      correlationId: req.correlationId,
    });
  }
}
