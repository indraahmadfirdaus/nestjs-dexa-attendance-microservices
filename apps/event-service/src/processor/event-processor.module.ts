import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventProcessor } from './event.processor';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
    AuditModule,
    NotificationModule,
  ],
  providers: [EventProcessor],
})
export class EventProcessorModule {}