import { Controller, Get } from '@nestjs/common';
import { EmployeeServiceService } from './employee-service.service';

@Controller()
export class EmployeeServiceController {
  constructor(private readonly employeeServiceService: EmployeeServiceService) {}

  @Get('health')
  getHealth() {
    return this.employeeServiceService.getHealth();
  }
}
