import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthServiceModule } from './auth-service.module';
import { AllExceptionsFilter, TransformInterceptor } from '@libs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const app = await NestFactory.create(AuthServiceModule);

  const configService = app.get(ConfigService);
  const port = configService.get('AUTH_SERVICE_PORT') || 3001;

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
  logger.log(`Auth Service running on http://localhost:${port}`);
}
bootstrap();