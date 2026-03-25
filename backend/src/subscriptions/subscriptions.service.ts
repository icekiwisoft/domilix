import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizePlanName(name: string) {
    const lower = name.toLowerCase();
    if (lower === 'ultime' || lower === 'ultimate') return 'Ultimate';
    if (lower === 'standart' || lower === 'standard') return 'Standart';
    if (lower === 'advantage') return 'Advantage';
    if (lower === 'premium') return 'Premium';
    return name;
  }

  private getPlanConfig(planName: string) {
    const normalized = this.normalizePlanName(planName);
    switch (normalized) {
      case 'Standart':
        return { price: 5, duration: 3, credits: 20 };
      case 'Advantage':
        return { price: 10, duration: 7, credits: 50 };
      case 'Premium':
        return { price: 20, duration: 14, credits: 100 };
      case 'Ultimate':
        return { price: 25, duration: 30, credits: 250 };
      default:
        return { price: 0, duration: 0, credits: 0 };
    }
  }

  private serialize(subscription: any, planName: string, user?: any) {
    return {
      id: Number(subscription.id),
      user: user
        ? {
            name: user.name,
            sex: user.sex,
            devise: user.devise,
            phone_number: user.phoneNumber,
            liked: 0,
            announcer: null,
          }
        : undefined,
      plan_name: planName,
      credits: subscription.credits,
      price: Number(subscription.price),
      duration: subscription.duration,
      expires_at: subscription.expireAt,
      created_at: subscription.createdAt,
      updated_at: subscription.updatedAt,
    };
  }

  async index(userId: bigint) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const plans = await this.prisma.subscriptionPlan.findMany();
    const byId = new Map(plans.map((plan) => [String(plan.id), plan.name] as const));
    return subscriptions.map((sub) => this.serialize(sub, byId.get(sub.subscriptionPlanId) || 'Unknown'));
  }

  async show(userId: bigint, id: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id: BigInt(id) } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.userId !== userId) throw new ForbiddenException('Unauthorized');
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: BigInt(subscription.subscriptionPlanId) } });
    return this.serialize(subscription, plan?.name || 'Unknown');
  }

  async create(userId: bigint, dto: CreateSubscriptionDto) {
    const normalizedMethod = dto.method.toLowerCase();
    const methodMap: Record<string, string> = {
      campay: 'campay',
      orange_money: 'orange',
      mtn_money: 'mtn',
      orange: 'orange',
      mtn: 'mtn',
    };
    const paymentMethod = methodMap[normalizedMethod];
    if (!paymentMethod) {
      return { code: 403, message: 'unsupported payment method' };
    }

    const planName = this.normalizePlanName(dto.plan_name);
    const config = this.getPlanConfig(planName);
    const paymentInfo =
      typeof dto.payment_info === 'string' ? dto.payment_info : JSON.stringify(dto.payment_info);

    const payment = await this.prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        userId,
        paymentType: 'subscription',
        paymentMethod,
        paymentInfo,
        paymentTypeInfo: planName,
        amount: config.price,
        status: 'pending',
      },
    });

    return {
      reference: payment.id,
      ussd_code: '*126#',
      operator: paymentMethod,
      amount: config.price,
      status: 'success',
      message: 'valid the transaction',
    };
  }

  async destroy(userId: bigint, id: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id: BigInt(id) } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.userId !== userId) throw new ForbiddenException('Unauthorized');
    await this.prisma.subscription.delete({ where: { id: subscription.id } });
    return { message: 'Subscription cancelled successfully' };
  }

  async handleCampayWebhook(externalReference: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: externalReference } });
    if (!payment) throw new NotFoundException('Payment not found');

    const planName = this.normalizePlanName(payment.paymentTypeInfo);
    const config = this.getPlanConfig(planName);
    const plan = await this.prisma.subscriptionPlan.findFirst({ where: { name: planName } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'completed' },
    });

    await this.prisma.subscription.create({
      data: {
        userId: payment.userId,
        subscriptionPlanId: String(plan.id),
        initialCredits: config.credits,
        credits: config.credits,
        price: config.price,
        duration: config.duration,
        expireAt: new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000),
      },
    });

    return null;
  }
}
