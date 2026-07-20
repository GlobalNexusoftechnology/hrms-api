import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';


import { CreateNotificationDto } from './dto/create-notification.dto';

import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationType } from '../../common/enums/NotificationType.enum';
import { NotificationPreference } from '../notification-preference/entities/notification-preference.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(NotificationPreference)
    private preferenceRepo: Repository<NotificationPreference>,
  ) {}

  private mapNotification(notification: Notification) {
    return {
      id: notification.id,

      title: notification.title,

      message: notification.message,

      type: notification.type,

      referenceId: notification.referenceId,

      isRead: notification.isRead,

      createdAt: notification.createdAt,
    };
  }

  async createNotification(dto: CreateNotificationDto) {
    const canSend = await this.canSendNotification(
      dto.employeeId,

      dto.type,
    );

    // preference disabled
    if (!canSend) {
      return null;
    }

    const notification = this.notificationRepo.create(dto);

    const saved = await this.notificationRepo.save(notification);

    return this.mapNotification(saved);
  }

  async findAll(employee: any, query: NotificationQueryDto) {
    const page = query.page ?? 1;

    const limit = Math.min(query.limit ?? 10, 50);

    const where: any = {
      employeeId: employee.id,
    };

    // unread filter
    if (query.unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await this.notificationRepo.findAndCount({
      where,

      order: {
        createdAt: 'DESC',
      },

      skip: (page - 1) * limit,

      take: limit,
    });

    return {
      data: notifications.map((notification) =>
        this.mapNotification(notification),
      ),

      meta: {
        total,
        page,
        limit,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, employee: any) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,

        employeeId: employee.id,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.mapNotification(notification);
  }

  async markAsRead(id: string, employee: any) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,

        employeeId: employee.id,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.isRead) {
      return {
        message: 'Notification already read',
      };
    }

    notification.isRead = true;

    await this.notificationRepo.save(notification);

    return {
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(employee: any) {
    await this.notificationRepo.update(
      {
        employeeId: employee.id,

        isRead: false,
      },

      {
        isRead: true,
      },
    );

    return {
      message: 'All notifications marked as read',
    };
  }

  async getUnreadCount(employee: any) {
    const count = await this.notificationRepo.count({
      where: {
        employeeId: employee.id,

        isRead: false,
      },
    });

    return {
      unreadCount: count,
    };
  }

  async remove(id: string, employee: any) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id,

        employeeId: employee.id,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.remove(notification);

    return {
      message: 'Notification deleted successfully',
    };
  }

  private async canSendNotification(
    employeeId: string,

    type: NotificationType,
  ) {
    const preference = await this.preferenceRepo.findOne({
      where: {
        employeeId,
      },
    });

    // no preference found
    // allow by default
    if (!preference) {
      return true;
    }

    const typeMap = {
      TASK: preference.task,

      LEAVE: preference.leave,

      ATTENDANCE: preference.attendance,

      PAYROLL: preference.payroll,

      PROJECT: preference.project,

      TEAM: preference.team,

      STANDUP: preference.standup,

      HOLIDAY: preference.holiday,

      TRAINING: preference.training,

      INTERVIEW: preference.interview,

      ANNOUNCEMENT: preference.announcement,

      GENERAL: true,
    };

    return typeMap[type] ?? true;
  }
}
