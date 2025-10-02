import { Test, TestingModule } from '@nestjs/testing';
import { EventServiceController } from './event-service.controller';
import { EventServiceService } from './event-service.service';

describe('EventServiceController', () => {
  let eventServiceController: EventServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventServiceController],
      providers: [EventServiceService],
    }).compile();

    eventServiceController = app.get<EventServiceController>(EventServiceController);
  });

  describe('root', () => {
    it('should return health status', () => {
      expect(eventServiceController.getHealth()).toEqual({
        status: 'ok',
        service: 'Event Service',
        timestamp: expect.any(String),
      });
    });
  });
});
