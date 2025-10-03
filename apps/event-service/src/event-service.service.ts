import { Injectable } from '@nestjs/common';

@Injectable()
export class EventServiceService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Event Service',
      timestamp: new Date().toISOString(),
      websocket: 'ws://localhost:3005/notifications',
    };
  }
}