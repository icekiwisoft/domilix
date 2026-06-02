import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdsService } from './ads.service';

describe('AdsService', () => {
  const createService = () => {
    const prisma = {
      ad: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
      },
      announcer: {
        findUnique: jest.fn(),
      },
    };

    const service = new AdsService(
      prisma as never,
      { getSignedUrl: jest.fn() } as never,
      { reverseGeocode: jest.fn() } as never,
    );

    return { service, prisma };
  };

  it('uses per_page for the public announces listing', async () => {
    const { service, prisma } = createService();

    const result = await service.index({ page: 2, per_page: '13' });

    expect(prisma.ad.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 13, take: 13 }),
    );
    expect(result.meta.per_page).toBe(13);
    expect(result.meta.current_page).toBe(2);
  });

  it('uses per_page for announcer scoped listing', async () => {
    const { service, prisma } = createService();

    const result = await service.index({
      AnnouncerId: 'announcer-id',
      per_page: '7',
    });

    expect(prisma.ad.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { announcerId: 'announcer-id' },
        skip: 0,
        take: 7,
      }),
    );
    expect(result.meta.per_page).toBe(7);
  });

  it('rejects admin update when user is not admin', async () => {
    const { service } = createService();

    await expect(
      service.updateAdAsAdmin('1', {}, { id: 1n, isAdmin: false }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates an ad as its real announcer owner for admins', async () => {
    const { service, prisma } = createService();
    prisma.ad.findUnique.mockResolvedValue({
      id: 1n,
      announcerId: 'announcer-id',
    });
    prisma.announcer.findUnique.mockResolvedValue({
      id: 'announcer-id',
      userId: 42n,
    });
    const updateSpy = jest
      .spyOn(service, 'updateAd')
      .mockResolvedValue({ id: 1 });

    await expect(
      service.updateAdAsAdmin(
        '1',
        { description: 'Test' },
        { id: 1n, isAdmin: true },
      ),
    ).resolves.toEqual({ id: 1 });
    expect(updateSpy).toHaveBeenCalledWith('1', { description: 'Test' }, 42n);
  });

  it('throws when admin update targets a missing ad', async () => {
    const { service, prisma } = createService();
    prisma.ad.findUnique.mockResolvedValue(null);

    await expect(
      service.updateAdAsAdmin('1', {}, { id: 1n, isAdmin: true }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
