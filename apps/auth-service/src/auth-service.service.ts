import { Injectable } from '@nestjs/common';
import { PrismaMainService } from '@libs/prisma-main';

@Injectable()
export class AuthServiceService {
  constructor(private readonly prisma: PrismaMainService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'Auth Service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}