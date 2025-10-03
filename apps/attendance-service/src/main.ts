import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AttendanceServiceModule } from './attendance-service.module';
import { AllExceptionsFilter, TransformInterceptor } from '@libs/common';

async function bootstrap() {
  const logger = new Logger('AttendanceService');
  const app = await NestFactory.create(AttendanceServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('ATTENDANCE_SERVICE_PORT') || 3003;

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
  logger.log(`Attendance Service running on http://localhost:${port}`);
}
bootstrap();