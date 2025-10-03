import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventServiceController } from './event-service.controller';
import { EventServiceService } from './event-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [EventServiceController],
  providers: [EventServiceService],
})
export class EventServiceModule {}
