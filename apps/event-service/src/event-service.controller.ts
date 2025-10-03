import { Controller, Get } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { Public } from '@libs/common';

@Controller()
export class EventServiceController {
  constructor(
    private readonly eventServiceService: EventServiceService,
  ) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.eventServiceService.getHealth();
  }
}