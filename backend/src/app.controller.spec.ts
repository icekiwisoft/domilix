import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getStats: jest.fn().mockResolvedValue({ users: 1, houses: 2 }),
            getHealth: jest.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns stats', async () => {
    await expect(appController.getStats()).resolves.toEqual({ users: 1, houses: 2 });
  });

  it('returns health', async () => {
    await expect(appController.getHealth()).resolves.toEqual({ status: 'ok' });
  });
});
