import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildLaravelPagination } from '../common/http/pagination';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async index(userId: bigint, unreadOnly = false, perPage = 20, page = 1) {
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildLaravelPagination(notifications.map((item) => ({
      id: Number(item.id),
      user_id: Number(item.userId),
      type: item.type,
      title: item.title,
      message: item.message,
      link: item.link,
      read: item.read,
      read_at: item.readAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })), {
      total,
      page,
      perPage,
      path: '/notifications',
      query: { unread_only: unreadOnly, per_page: perPage },
    });
  }

  async unreadCount(userId: bigint) {
    const count = await this.prisma.notification.count({ where: { userId, read: false } });
    return { count };
  }

  async markAsRead(userId: bigint, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id: BigInt(id), userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    const updated = notification.read
      ? notification
      : await this.prisma.notification.update({
          where: { id: notification.id },
          data: { read: true, readAt: new Date() },
        });

    return {
      message: 'Notification marquee comme lue',
      notification: updated,
    };
  }

  async markAllAsRead(userId: bigint) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { message: 'Toutes les notifications ont ete marquees comme lues' };
  }

  async destroy(userId: bigint, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id: BigInt(id), userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.prisma.notification.delete({ where: { id: notification.id } });
    return { message: 'Notification supprimee' };
  }

  async deleteAllRead(userId: bigint) {
    await this.prisma.notification.deleteMany({ where: { userId, read: true } });
    return { message: 'Toutes les notifications lues ont ete supprimees' };
  }
}
