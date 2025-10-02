import { Module, Global } from '@nestjs/common';
import { PrismaEventsService } from './prisma-events.service';

@Global()
@Module({
  providers: [PrismaEventsService],
  exports: [PrismaEventsService],
})
export class PrismaEventsModule {}