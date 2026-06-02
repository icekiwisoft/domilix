import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { buildLaravelPagination } from '../../common/http/pagination';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Unauthorized');
    }
  }

  private serialize(subscription: any, planName: string) {
    const now = new Date();
    const expiresAt = subscription.expireAt || subscription.endDate;
    const status = expiresAt && expiresAt <= now
      ? 'expired'
      : subscription.credits <= 0
        ? 'expired'
        : 'active';

    return {
      id: Number(subscription.id),
      user: {
        id: Number(subscription.user.id),
        name: subscription.user.name,
        email: subscription.user.email,
        phone_number: subscription.user.phoneNumber,
        phone_verified: subscription.user.phoneVerified,
        email_verified: subscription.user.emailVerified,
        is_admin: subscription.user.isAdmin,
        created_at: subscription.user.createdAt,
      },
      plan_name: planName,
      status,
      initial_credits: subscription.initialCredits,
      credits: subscription.credits,
      price: Number(subscription.price),
      duration: subscription.duration,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      expires_at: subscription.expireAt,
      created_at: subscription.createdAt,
      updated_at: subscription.updatedAt,
    };
  }

  async index(currentUser: any, page = 1) {
    this.ensureAdmin(currentUser);

    const perPage = 20;
    const [subscriptions, total, plans] = await Promise.all([
      this.prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { user: true },
      }),
      this.prisma.subscription.count(),
      this.prisma.subscriptionPlan.findMany(),
    ]);

    const planNamesById = new Map(plans.map((plan) => [String(plan.id), plan.name] as const));
    const data = subscriptions.map((subscription) => (
      this.serialize(subscription, planNamesById.get(subscription.subscriptionPlanId) || 'Unknown')
    ));

    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/admin/subscriptions',
      query: { page },
    });
  }

  async show(currentUser: any, id: string) {
    this.ensureAdmin(currentUser);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: BigInt(id) },
      include: { user: true },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: BigInt(subscription.subscriptionPlanId) },
    });

    return this.serialize(subscription, plan?.name || 'Unknown');
  }

  async destroy(currentUser: any, id: string) {
    this.ensureAdmin(currentUser);

    const subscription = await this.prisma.subscription.findUnique({ where: { id: BigInt(id) } });
    if (!subscription) throw new NotFoundException('Subscription not found');

    await this.prisma.subscription.delete({ where: { id: subscription.id } });
    return { message: 'Subscription deleted successfully' };
  }
}
