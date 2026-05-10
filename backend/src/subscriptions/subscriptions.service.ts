import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
        return { price: 50, duration: 7, credits: 20 };
      case 'Advantage':
        return { price: 100, duration: 14, credits: 50 };
      case 'Premium':
        return { price: 200, duration: 21, credits: 100 };
      case 'Ultimate':
        return { price: 250, duration: 28, credits: 150 };
      default:
        return { price: 0, duration: 0, credits: 0 };
    }
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getCampayConfig() {
    const token = process.env.CAMPAY_TOKEN;
    const endpoint = process.env.CAMPAY_ENDPOINT || 'https://demo.campay.net/api/collect/';

    if (!token) {
      throw new InternalServerErrorException('CAMPAY_TOKEN is not configured.');
    }

    return { token, endpoint };
  }

  private normalizePaymentInfo(paymentInfo: unknown) {
    if (typeof paymentInfo === 'string') return paymentInfo;
    if (paymentInfo && typeof paymentInfo === 'object') {
      const info = paymentInfo as Record<string, unknown>;
      const phone = info.phone_number || info.phone || info.msisdn || info.from;
      if (typeof phone === 'string') return phone;
      if (typeof phone === 'number') return String(phone);
    }
    throw new BadRequestException('payment_info must contain a phone number.');
  }

  private async collectCampayPayment(data: {
    amount: number;
    from: string;
    externalReference: string;
    description: string;
  }) {
    const { token, endpoint } = this.getCampayConfig();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        from: data.from,
        description: data.description,
        external_reference: data.externalReference,
      }),
    });

    const text = await response.text();
    let payload: unknown = text;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new BadRequestException({
        message: 'Campay payment request failed.',
        status: response.status,
        response: payload,
      });
    }

    return payload;
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
      start_date: subscription.startDate,
      end_date: subscription.endDate,
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
      orange_money: 'orange',
      mtn_money: 'mtn',
      orange: 'orange',
      mtn: 'mtn',
    };
    const paymentMethod = methodMap[normalizedMethod];
    if (!paymentMethod) {
      throw new BadRequestException('Unsupported payment method.');
    }

    const planName = this.normalizePlanName(dto.plan_name);
    const config = this.getPlanConfig(planName);
    if (config.price <= 0) {
      throw new BadRequestException('Unsupported subscription plan.');
    }

    const paymentInfo = this.normalizePaymentInfo(dto.payment_info);

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

    const campayResponse = await this.collectCampayPayment({
      amount: config.price,
      from: paymentInfo,
      description: `Domilix ${planName}`,
      externalReference: payment.id,
    });

    return {
      message: 'Campay payment request sent.',
      payment_id: payment.id,
      provider: 'campay',
      campay: campayResponse,
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

    if (payment.status === 'completed' && payment.referenceId) {
      const subscription = await this.prisma.subscription.findUnique({ where: { id: payment.referenceId } });
      if (subscription) return this.serialize(subscription, payment.paymentTypeInfo);
    }
    if (payment.status === 'completed') {
      return { message: 'Payment already processed.' };
    }

    const planName = this.normalizePlanName(payment.paymentTypeInfo);
    const config = this.getPlanConfig(planName);
    const plan = await this.prisma.subscriptionPlan.findFirst({ where: { name: planName } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const startDate = new Date();
    const endDate = this.addDays(startDate, config.duration);

    const subscription = await this.prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          userId: payment.userId,
          subscriptionPlanId: String(plan.id),
          initialCredits: config.credits,
          credits: config.credits,
          price: config.price,
          duration: config.duration,
          startDate,
          endDate,
          expireAt: endDate,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'completed', referenceId: created.id },
      });

      return created;
    });

    return this.serialize(subscription, planName);
  }
}
