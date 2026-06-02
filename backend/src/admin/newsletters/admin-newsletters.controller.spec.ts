import { ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { AdminNewslettersController } from './admin-newsletters.controller';

describe('AdminNewslettersController', () => {
  const createController = () => {
    const newslettersService = {
      index: jest.fn().mockResolvedValue({ data: [] }),
      show: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1, verified: true }),
      destroy: jest.fn().mockResolvedValue(null),
    };
    const controller = new AdminNewslettersController(
      newslettersService as never,
    );

    return { controller, newslettersService };
  };

  it('rejects listing for non-admin users', () => {
    const { controller } = createController();

    expect(() => controller.index({ id: 1n, isAdmin: false }, {})).toThrow(
      ForbiddenException,
    );
  });

  it('lists subscribers for admin users', async () => {
    const { controller, newslettersService } = createController();
    const query = { status: 'verified' as const, page: '1' };

    await expect(
      controller.index({ id: 1n, isAdmin: true }, query),
    ).resolves.toEqual({ data: [] });
    expect(newslettersService.index).toHaveBeenCalledWith(query);
  });

  it('deletes subscribers for admin users', async () => {
    const { controller, newslettersService } = createController();
    const status = jest.fn().mockReturnThis();
    const response = {
      status,
      send: jest.fn(),
    } as unknown as Response;

    await controller.destroy({ id: 1n, isAdmin: true }, '1', response);

    expect(newslettersService.destroy).toHaveBeenCalledWith('1');
    expect(status).toHaveBeenCalledWith(204);
  });
});
