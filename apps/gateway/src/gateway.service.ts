import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Gateway',
      timestamp: new Date().toISOString(),
    };
  }
}