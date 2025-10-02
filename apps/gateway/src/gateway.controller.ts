import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { TransformInterceptor } from '@libs/common';

@Controller()
@UseInterceptors(TransformInterceptor)
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('health')
  getHealth() {
    return this.gatewayService.getHealth();
  }
}