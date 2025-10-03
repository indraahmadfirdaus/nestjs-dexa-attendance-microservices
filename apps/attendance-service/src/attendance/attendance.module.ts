import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuthModule, GeocodingModule } from '@libs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [
    AuthModule,
    GeocodingModule,
    BullModule.registerQueue({
      name: 'events',
    }),
    PrismaMainModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}