import { Test, TestingModule } from '@nestjs/testing';
import { PrismaEventsService } from './prisma-events.service';

describe('PrismaEventsService', () => {
  let service: PrismaEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaEventsService],
    }).compile();

    service = module.get<PrismaEventsService>(PrismaEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
