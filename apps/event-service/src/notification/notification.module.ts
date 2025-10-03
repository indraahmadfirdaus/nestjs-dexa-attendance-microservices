import { Module } from '@nestjs/common';
import { PrismaEventsModule } from '@libs/prisma-events';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuthModule } from '@libs/common/auth';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [AuthModule, PrismaEventsModule, PrismaMainModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}