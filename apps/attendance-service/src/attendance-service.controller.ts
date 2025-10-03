import { Controller, Get } from '@nestjs/common';
import { AttendanceServiceService } from './attendance-service.service';
import { Public } from '@libs/common';

@Controller()
export class AttendanceServiceController {
  constructor(
    private readonly attendanceServiceService: AttendanceServiceService,
  ) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.attendanceServiceService.getHealth();
  }
}