import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuthModule } from '@libs/common/auth';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@libs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PrismaMainModule,
  ],
  controllers: [AuthServiceController],
  providers: [
    AuthServiceService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthServiceService],
})
export class AuthServiceModule {}