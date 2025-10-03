import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaEventsService } from '@libs/prisma-events';
import { PrismaMainService } from '@libs/prisma-main';
import { PaginatedResult } from '@libs/common';
import { QueryNotificationDto, MarkReadDto } from './dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaEventsService,
    private readonly prismaMain: PrismaMainService,
  ) {}

  async create(data: {
    recipientId: string;
    senderId: string;
    senderName: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        senderName: data.senderName,
        type: data.type as any,
        title: data.title,
        message: data.message,
        metadata: data.metadata || null,
        isRead: false,
      },
    });

    this.logger.log(
      `Notification created: ${data.type} for ${data.recipientId}`,
    );

    return notification;
  }

  async findAll(
    recipientId: string,
    queryDto: QueryNotificationDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, isRead } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {
      recipientId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const total = await this.prisma.notification.count({ where });

    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, recipientId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== recipientId) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(markReadDto: MarkReadDto, recipientId: string) {
    const { notificationIds } = markReadDto;

    const result = await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        recipientId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(
      `Marked ${result.count} notifications as read for ${recipientId}`,
    );

    return {
      success: true,
      count: result.count,
    };
  }

  async markAllAsRead(recipientId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(
      `Marked all ${result.count} notifications as read for ${recipientId}`,
    );

    return {
      success: true,
      count: result.count,
    };
  }

  async getUnreadCount(recipientId: string) {
    const count = await this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });

    return { count };
  }

  async getAdminUsers() {
    return this.prismaMain.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}