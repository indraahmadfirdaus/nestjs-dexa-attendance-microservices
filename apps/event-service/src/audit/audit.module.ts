import { Module } from '@nestjs/common';
import { PrismaEventsModule } from '@libs/prisma-events';
import { AuthModule } from '@libs/common/auth';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [AuthModule, PrismaEventsModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}