import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthLog, AuthEvent, AuthStatus } from './entities/auth-log.entity';

@Injectable()
export class AuthLogService {
  private readonly logger = new Logger(AuthLogService.name);

  constructor(
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>,
  ) {}

  logEvent(data: {
    userId?: string;
    sessionId?: string;
    event: AuthEvent;
    status: AuthStatus;
    ipAddress?: string;
    device?: string;
    reason?: string;
  }): void {
    setImmediate(async () => {
      try {
        const newLog = this.authLogRepository.create(data);
        await this.authLogRepository.save(newLog);
      } catch (error) {
        this.logger.error(
          `Failed to save auth log: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, userId, event, status } = query;
    const qb = this.authLogRepository.createQueryBuilder('authLog');

    if (userId) {
      qb.andWhere('authLog.userId = :userId', { userId });
    }
    if (event) {
      qb.andWhere('authLog.event = :event', { event });
    }
    if (status) {
      qb.andWhere('authLog.status = :status', { status });
    }

    qb.orderBy('authLog.createdAt', 'DESC');
    
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }
}
