import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaEventsModule } from '@libs/prisma-events';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuditModule } from './audit/audit.module';
import { NotificationModule } from './notification/notification.module';
import { EventProcessorModule } from './processor/event-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    PrismaEventsModule,
    PrismaMainModule,
    AuditModule,
    NotificationModule,
    EventProcessorModule,
  ],
  controllers: [],
  providers: [],
})
export class EventServiceModule {}