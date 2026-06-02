import { ForbiddenException } from '@nestjs/common';
import { AdminAnnouncersController } from './admin-announcers.controller';

describe('AdminAnnouncersController', () => {
  const createController = () => {
    const announcersService = {
      index: jest.fn().mockResolvedValue({ data: [] }),
      show: jest.fn().mockResolvedValue({ id: 'announcer-id' }),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn().mockResolvedValue(null),
    };
    const objectStorage = { uploadFile: jest.fn() };
    const controller = new AdminAnnouncersController(
      announcersService as never,
      objectStorage as never,
    );

    return { controller, announcersService };
  };

  it('rejects listing for non-admin users', () => {
    const { controller } = createController();

    expect(() => controller.index({ id: 1n, isAdmin: false }, {})).toThrow(
      ForbiddenException,
    );
  });

  it('allows admin users to list announcers', async () => {
    const { controller, announcersService } = createController();

    await expect(
      controller.index({ id: 1n, isAdmin: true }, { page: 1 }),
    ).resolves.toEqual({ data: [] });
    expect(announcersService.index).toHaveBeenCalledWith({ page: 1 });
  });
});
