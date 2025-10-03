import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { QueryNotificationDto, MarkReadDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '@libs/common';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() queryDto: QueryNotificationDto,
  ) {
    return this.notificationService.findAll(userId, queryDto);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.notificationService.findOne(id, userId);
  }

  @Post('mark-as-read')
  markAsRead(
    @Body() markReadDto: MarkReadDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.markAsRead(markReadDto, userId);
  }

  @Post('mark-all-as-read')
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}