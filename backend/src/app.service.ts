import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [furnitures, houses, announcers, users, verifiedAnnouncers] =
      await Promise.all([
        this.prisma.ad.count({ where: { itemType: 'App\\Models\\Furniture' } }),
        this.prisma.ad.count({ where: { itemType: 'App\\Models\\RealEstate' } }),
        this.prisma.announcer.count(),
        this.prisma.user.count(),
        this.prisma.announcer.count({ where: { verified: true } }),
      ]);

    return {
      furnitures,
      houses,
      announcers,
      users,
      month_income: 0,
      mont: new Date().getMonth() + 1,
      verified_announcers: verifiedAnnouncers,
    };
  }

  async getHealth() {
    let database = 'up';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      services: { database },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
