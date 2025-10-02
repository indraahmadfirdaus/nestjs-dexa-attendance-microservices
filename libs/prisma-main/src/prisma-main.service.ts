import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as PrismaMainClient } from '@prisma/client-main';

@Injectable()
export class PrismaMainService
  extends PrismaMainClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to Main Database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Disconnected from Main Database');
  }
}