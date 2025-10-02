import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

describe('EmployeeServiceController', () => {
  let employeeServiceController: EmployeeServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeServiceController],
      providers: [EmployeeServiceService],
    }).compile();

    employeeServiceController = app.get<EmployeeServiceController>(EmployeeServiceController);
  });

  describe('root', () => {
    it('should return "Healthy"', () => {
      expect(employeeServiceController.getHealth()).toEqual({
        status: 'ok',
        service: 'Employee Service',
        timestamp: expect.any(String),
        database: 'connected',
      });
    });
  });
});
