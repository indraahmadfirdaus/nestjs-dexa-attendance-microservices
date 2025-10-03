import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaMainService } from '@libs/prisma-main';
import { MinioService } from '@libs/common'; // Changed to MinioService
import { EventPattern } from '@libs/common/events';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaMainService,
    private readonly minioService: MinioService, // Changed to MinioService
    @InjectQueue('events') private eventsQueue: Queue,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, req: any) {
    // Get old data
    const oldUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile updated: ${updatedUser.email}`);

    // Determine event type based on what was updated
    let eventType = EventPattern.PROFILE_UPDATED;
    if (updateProfileDto.photoUrl && updateProfileDto.photoUrl !== oldUser.photoUrl) {
      eventType = EventPattern.PHOTO_UPDATED;
    } else if (updateProfileDto.phone && updateProfileDto.phone !== oldUser.phone) {
      eventType = EventPattern.PHONE_UPDATED;
    }

    // Emit event to queue
    await this.eventsQueue.add(eventType, {
      userId: updatedUser.id,
      userName: updatedUser.name,
      eventType,
      eventAction: 'updated',
      oldData: {
        phone: oldUser.phone,
        photoUrl: oldUser.photoUrl,
      },
      newData: {
        phone: updatedUser.phone,
        photoUrl: updatedUser.photoUrl,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });

    return updatedUser;
  }

  async uploadPhoto(userId: string, file: Express.Multer.File, req: any) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }

    const oldUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    // Upload to MinIO
    const photoUrl = await this.minioService.uploadFile(file, 'photos');

    // Delete old photo from MinIO if exists
    if (oldUser.photoUrl) {
      try {
        const oldFileName = this.minioService.extractFileName(oldUser.photoUrl);
        const fileExists = await this.minioService.fileExists(oldFileName);
        
        if (fileExists) {
          await this.minioService.deleteFile(oldFileName);
          this.logger.log(`Old photo deleted: ${oldFileName}`);
        }
      } catch (error) {
        this.logger.warn('Failed to delete old photo from MinIO', error);
      }
    }

    // Update user with new photo URL
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { photoUrl },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
      },
    });

    this.logger.log(`Photo uploaded to MinIO: ${updatedUser.email}`);

    // Emit event
    await this.eventsQueue.add(EventPattern.PHOTO_UPDATED, {
      userId: updatedUser.id,
      userName: updatedUser.name,
      eventType: EventPattern.PHOTO_UPDATED,
      eventAction: 'updated',
      oldData: { photoUrl: oldUser.photoUrl },
      newData: { photoUrl: updatedUser.photoUrl },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });

    return updatedUser;
  }
}