import { Module, Global } from '@nestjs/common';
import { PrismaMainService } from './prisma-main.service';

@Global()
@Module({
  providers: [PrismaMainService],
  exports: [PrismaMainService],
})
export class PrismaMainModule {}