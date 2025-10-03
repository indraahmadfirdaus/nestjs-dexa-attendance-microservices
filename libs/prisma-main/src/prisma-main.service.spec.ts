import { Test, TestingModule } from '@nestjs/testing';
import { PrismaMainService } from './prisma-main.service';

describe('PrismaMainService', () => {
  let service: PrismaMainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaMainService],
    }).compile();

    service = module.get<PrismaMainService>(PrismaMainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
