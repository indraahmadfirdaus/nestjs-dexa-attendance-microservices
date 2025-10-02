import { Injectable } from '@nestjs/common';
import { PrismaMainService } from '@libs/prisma-main';

@Injectable()
export class EmployeeServiceService {
  constructor(private readonly prisma: PrismaMainService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'Employee Service',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}