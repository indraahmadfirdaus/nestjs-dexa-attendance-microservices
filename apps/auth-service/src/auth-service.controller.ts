import { Controller, Get } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Get('health')
  getHealth() {
    return this.authServiceService.getHealth();
  }
}