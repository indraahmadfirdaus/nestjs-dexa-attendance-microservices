import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaMainService } from '@libs/prisma-main';
import { GeocodingService, DateUtil, PaginatedResult } from '@libs/common';
import { EventPattern } from '@libs/common/events';
import { ClockInDto, ClockOutDto, QueryAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaMainService,
    private readonly geocodingService: GeocodingService,
    @InjectQueue('events') private eventsQueue: Queue,
  ) {}

  async clockIn(userId: string, clockInDto: ClockInDto) {
    const { latitude, longitude, notes } = clockInDto;

    if (!this.geocodingService.isValidCoordinates(latitude, longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = DateUtil.startOfDay(new Date());
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Already clocked in today');
    }

    let address = null;
    try {
      address = await this.geocodingService.reverseGeocode(latitude, longitude);
    } catch (error) {
      this.logger.warn('Failed to get address, continuing without it', error);
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        date: today,
        clockIn: new Date(),
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        clockInAddress: address,
        notes,
        status: 'PRESENT',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
      },
    });

    this.logger.log(`User ${user.email} clocked in at ${attendance.clockIn}`);

    await this.eventsQueue.add(EventPattern.ATTENDANCE_CLOCK_IN, {
      userId: user.id,
      userName: user.name,
      eventType: EventPattern.ATTENDANCE_CLOCK_IN,
      eventAction: 'created',
      newData: {
        id: attendance.id,
        clockIn: attendance.clockIn,
        location: { latitude, longitude, address },
      },
      timestamp: new Date(),
    });

    return attendance;
  }

  async clockOut(userId: string, clockOutDto: ClockOutDto) {
    const { latitude, longitude, notes } = clockOutDto;

    if (!this.geocodingService.isValidCoordinates(latitude, longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = DateUtil.startOfDay(new Date());
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (!attendance) {
      throw new NotFoundException('No clock in record found for today. Please clock in first.');
    }

    if (attendance.clockOut) {
      throw new ConflictException('Already clocked out today');
    }

    let address = null;
    try {
      address = await this.geocodingService.reverseGeocode(latitude, longitude);
    } catch (error) {
      this.logger.warn('Failed to get address, continuing without it', error);
    }

    const updatedAttendance = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: new Date(),
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
        clockOutAddress: address,
        notes: notes || attendance.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
      },
    });

    this.logger.log(`User ${user.email} clocked out at ${updatedAttendance.clockOut}`);

    await this.eventsQueue.add(EventPattern.ATTENDANCE_CLOCK_OUT, {
      userId: user.id,
      userName: user.name,
      eventType: EventPattern.ATTENDANCE_CLOCK_OUT,
      eventAction: 'updated',
      newData: {
        id: updatedAttendance.id,
        clockIn: updatedAttendance.clockIn,
        clockOut: updatedAttendance.clockOut,
        location: { latitude, longitude, address },
      },
      timestamp: new Date(),
    });

    return updatedAttendance;
  }

  async getTodayAttendance(userId: string) {
    const today = DateUtil.startOfDay(new Date());
    
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            photoUrl: true,
          },
        },
      },
    });

    return attendance;
  }

  async getSummary(
    userId: string,
    queryDto: QueryAttendanceDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const start = startDate
      ? DateUtil.parseDate(startDate)
      : DateUtil.startOfMonth(new Date());
    const end = endDate
      ? DateUtil.parseDate(endDate)
      : DateUtil.endOfDay(new Date());

    const where = {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    };

    const total = await this.prisma.attendance.count({ where });

    const attendances = await this.prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        date: true,
        clockIn: true,
        clockInLatitude: true,
        clockInLongitude: true,
        clockInAddress: true,
        clockOut: true,
        clockOutLatitude: true,
        clockOutLongitude: true,
        clockOutAddress: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: attendances,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllAttendances(
    queryDto: QueryAttendanceDto,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const start = startDate
      ? DateUtil.parseDate(startDate)
      : DateUtil.startOfMonth(new Date());
    const end = endDate
      ? DateUtil.parseDate(endDate)
      : DateUtil.endOfDay(new Date());

    const where = {
      date: {
        gte: start,
        lte: end,
      },
    };

    const total = await this.prisma.attendance.count({ where });

    const attendances = await this.prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { date: 'desc' },
        { clockIn: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            photoUrl: true,
          },
        },
      },
    });

    return {
      data: attendances,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAttendanceById(id: string, userId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (attendance.userId !== userId && user.role !== 'ADMIN') {
      throw new BadRequestException('You can only view your own attendance');
    }

    return attendance;
  }
}