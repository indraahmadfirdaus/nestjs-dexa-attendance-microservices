import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaEventsService } from '@libs/prisma-events';
import { PaginatedResult, DateUtil } from '@libs/common';
import { QueryAuditLogDto } from './dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaEventsService) {}

  async create(data: {
    userId: string;
    userName: string;
    eventType: string;
    eventAction: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        eventType: data.eventType as any,
        eventAction: data.eventAction,
        oldData: data.oldData || null,
        newData: data.newData || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });

    this.logger.log(
      `Audit log created: ${data.eventType} by ${data.userName} (${data.userId})`,
    );

    return auditLog;
  }

  async findAll(queryDto: QueryAuditLogDto): Promise<PaginatedResult<any>> {
    const { page, limit, userId, eventType, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = DateUtil.parseDate(startDate);
      }
      if (endDate) {
        where.createdAt.lte = DateUtil.endOfDay(DateUtil.parseDate(endDate));
      }
    }

     const total = await this.prisma.auditLog.count({ where });

    const auditLogs = await this.prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: auditLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return auditLog;
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const total = await this.prisma.auditLog.count({ where });

    const byEventType = await this.prisma.auditLog.groupBy({
      by: ['eventType'],
      where,
      _count: {
        eventType: true,
      },
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    const today = DateUtil.startOfDay(new Date());
    const todayCount = await this.prisma.auditLog.count({
      where: {
        ...where,
        createdAt: {
          gte: today,
        },
      },
    });

    return {
      total,
      today: todayCount,
      byEventType: byEventType.map((item) => ({
        eventType: item.eventType,
        count: item._count.eventType,
      })),
    };
  }
}