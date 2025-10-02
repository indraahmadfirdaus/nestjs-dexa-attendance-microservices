import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaMainModule } from '@libs/prisma-main';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeServiceService } from './employee-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaMainModule,
  ],
  controllers: [EmployeeServiceController],
  providers: [EmployeeServiceService],
})
export class EmployeeServiceModule {}