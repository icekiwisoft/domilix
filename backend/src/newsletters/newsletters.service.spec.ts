import { BadRequestException } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';

const newsletterRow = {
  id: 1n,
  clientId: 'client-id',
  email: 'client@domilix.com',
  verificationToken: 'token',
  verified: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};

type CreateNewsletterArgs = {
  data: {
    email: string;
    verified: boolean;
    clientId: string;
    verificationToken: string;
  };
};

describe('NewslettersService', () => {
  const createService = () => {
    const createNewsletter = jest.fn<
      Promise<unknown>,
      [CreateNewsletterArgs]
    >();
    const prisma = {
      newsletter: {
        findMany: jest.fn().mockResolvedValue([newsletterRow]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn(),
        create: createNewsletter,
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const service = new NewslettersService(prisma as never);

    return { service, prisma };
  };

  it('lists subscribers with admin filters and pagination', async () => {
    const { service, prisma } = createService();

    const result = await service.index({
      page: '2',
      per_page: '10',
      search: 'domilix',
      status: 'pending',
    });

    expect(prisma.newsletter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { verified: false, email: { contains: 'domilix' } },
        skip: 10,
        take: 10,
      }),
    );
    expect(result.data).toEqual([
      expect.objectContaining({ email: 'client@domilix.com', verified: false }),
    ]);
    expect(result.meta.current_page).toBe(2);
    expect(result.meta.per_page).toBe(10);
  });

  it('rejects duplicate newsletter emails', async () => {
    const { service, prisma } = createService();
    prisma.newsletter.findFirst.mockResolvedValue(newsletterRow);

    await expect(
      service.store({ email: 'client@domilix.com', website: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.newsletter.create).not.toHaveBeenCalled();
  });

  it('creates an unverified subscription with a token', async () => {
    const { service, prisma } = createService();
    prisma.newsletter.findFirst.mockResolvedValue(null);

    const result = await service.store({
      email: 'new@domilix.com',
      website: '',
    });
    const createCall = prisma.newsletter.create.mock.calls[0]?.[0];

    expect(result.message).toContain('Subscription successful');
    expect(createCall?.data.email).toBe('new@domilix.com');
    expect(createCall?.data.verified).toBe(false);
    expect(typeof createCall?.data.clientId).toBe('string');
    expect(typeof createCall?.data.verificationToken).toBe('string');
  });
});
