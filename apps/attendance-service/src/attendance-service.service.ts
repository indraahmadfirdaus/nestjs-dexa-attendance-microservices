import { Injectable } from '@nestjs/common';

@Injectable()
export class AttendanceServiceService {
  getHealth() {
    return {
      status: 'ok',
      service: 'Attendance Service',
      timestamp: new Date().toISOString(),
    };
  }
}