import 'dotenv/config';

import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.ensureDefaultUsers();
    await this.ensureDefaultAnnouncer();
    await this.ensureDefaultCategories();
    await this.ensureDefaultSubscriptionPlans();
    await this.ensureDefaultNewsletter();
  }

  private async ensureDefaultUsers() {
    const defaults = [
      {
        name: 'domilix',
        email: 'announcer@domilix.com',
        phoneNumber: '+237698555511',
        password: 'domilix2024',
        phoneVerified: true,
        isAdmin: true,
      },
      {
        name: 'nguewo fossong christian',
        email: 'ngdream1953@gmail.com',
        phoneNumber: '+237696555511',
        password: 'nguewo',
        phoneVerified: true,
        isAdmin: true,
      },
    ];

    for (const item of defaults) {
      const existing = await this.user.findFirst({
        where: {
          OR: [{ email: item.email }, { phoneNumber: item.phoneNumber }],
        },
      });

      if (existing) continue;

      await this.user.create({
        data: {
          name: item.name,
          email: item.email,
          phoneNumber: item.phoneNumber,
          password: await bcrypt.hash(item.password, 10),
          phoneVerified: item.phoneVerified,
          isAdmin: item.isAdmin,
        },
      });
    }
  }

  private async ensureDefaultAnnouncer() {
    const defaultUser = await this.user.findFirst({
      where: { email: 'announcer@domilix.com' },
    });

    if (!defaultUser) return;

    const existing = await this.announcer.findFirst({
      where: { userId: defaultUser.id },
    });

    if (existing) return;

    await this.announcer.create({
      data: {
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        name: 'Domilix',
        userId: defaultUser.id,
        verified: true,
      },
    });
  }

  private async ensureDefaultCategories() {
    const defaults = [
      { type: 'house' as const, name: 'Apartment' },
      { type: 'house' as const, name: 'Room' },
      { type: 'house' as const, name: 'House' },
      { type: 'house' as const, name: 'Studio' },
      { type: 'furniture' as const, name: 'Sofas' },
      { type: 'furniture' as const, name: 'Tables' },
      { type: 'furniture' as const, name: 'Chairs' },
      { type: 'furniture' as const, name: 'Beds' },
    ];

    for (const item of defaults) {
      const existing = await this.category.findFirst({
        where: { name: item.name },
      });

      if (existing) continue;

      await this.category.create({
        data: {
          clientId: crypto.randomUUID(),
          type: item.type,
          name: item.name,
        },
      });
    }
  }

  private async ensureDefaultSubscriptionPlans() {
    const plans = ['Standart', 'Advantage', 'Premium', 'Ultimate'];

    for (const name of plans) {
      const existing = await this.subscriptionPlan.findFirst({ where: { name } });
      if (existing) continue;

      await this.subscriptionPlan.create({
        data: { name },
      });
    }
  }

  private async ensureDefaultNewsletter() {
    const email = 'ngdream1953@gmail.com';
    const existing = await this.newsletter.findFirst({ where: { email } });
    if (existing) return;

    await this.newsletter.create({
      data: {
        clientId: crypto.randomUUID(),
        email,
        verified: true,
        verificationToken: crypto.randomUUID(),
      },
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
