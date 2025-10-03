import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaMainModule } from '@libs/prisma-main';
import { AuthModule, MinioModule } from '@libs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [
    AuthModule,
    MinioModule,
    BullModule.registerQueue({
      name: 'events',
    }),
    PrismaMainModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}