import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(query: Record<string, unknown>) { return this.list('notifications', query); }
  findById(id: string) { return this.findOne('notifications', id); }
  createNotification(body: unknown) { return this.create('notifications', body); }
  markRead(id: string) { return this.markNotificationRead(id); }
  markAllRead(user?: unknown) { return this.markAllNotificationsRead(user as never); }
  deleteNotification(id: string) { return this.remove('notifications', id); }
}
