import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeeServiceModule } from './employee-service.module';
import { AllExceptionsFilter, TransformInterceptor } from '@libs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('EmployeeService');
  const app = await NestFactory.create<NestExpressApplication>(EmployeeServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('EMPLOYEE_SERVICE_PORT') || 3002;

  // Enable CORS
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
  logger.log(`Employee Service running on http://localhost:${port}`);
}
bootstrap();