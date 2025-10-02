import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventServiceModule } from './event-service.module';

async function bootstrap() {
  const logger = new Logger('EventService');
  const app = await NestFactory.create(EventServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('EVENT_SERVICE_PORT') || 3004;

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
  logger.log(`Event Service running on http://localhost:${port}`);
}
bootstrap();