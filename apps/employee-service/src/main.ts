import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const logger = new Logger('EmployeeService');
  const app = await NestFactory.create(EmployeeServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('EMPLOYEE_SERVICE_PORT') || 3002;

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
  logger.log(`Employee Service running on http://localhost:${port}`);
}
bootstrap();