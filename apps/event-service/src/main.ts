import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventServiceModule } from './event-service.module';
import { AllExceptionsFilter, TransformInterceptor } from '@libs/common';

async function bootstrap() {
  const logger = new Logger('EventService');
  const app = await NestFactory.create(EventServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('EVENT_SERVICE_PORT') || 3005;

  app.enableCors({
    origin: '*',
    credentials: true,
  });

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
  logger.log(`Event Service running on http://localhost:${port}`);
  logger.log(`WebSocket Server running on ws://localhost:${port}/notifications`);
}
bootstrap();