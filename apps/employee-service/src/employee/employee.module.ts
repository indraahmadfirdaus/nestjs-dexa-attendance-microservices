import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuthModule } from '@libs/common/auth'; // Import from common
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'events',
    }),
    PrismaMainModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}