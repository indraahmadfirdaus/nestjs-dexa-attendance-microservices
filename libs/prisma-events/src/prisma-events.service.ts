import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as PrismaEventsClient } from '@prisma/client-events';

@Injectable()
export class PrismaEventsService
  extends PrismaEventsClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to Events Database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Disconnected from Events Database');
  }
}