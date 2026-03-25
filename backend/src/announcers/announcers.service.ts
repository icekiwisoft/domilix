import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAnnouncersDto } from './dto/query-announcers.dto';
import { buildLaravelPagination } from '../common/http/pagination';
import { storageUrl } from '../common/http/formatters';
import { UpsertAnnouncerDto } from './dto/upsert-announcer.dto';

@Injectable()
export class AnnouncersService {
  constructor(private readonly prisma: PrismaService) {}

  private async serializeAnnouncer(announcer: {
    id: string;
    name: string;
    avatar: string | null;
    contact: string | null;
    bio: string | null;
    verified: boolean;
    createdAt: Date | null;
    user: { name: string; sex: string; devise: string; phoneNumber: string; email: string };
  }) {
    const [houses, furnitures] = await Promise.all([
      this.prisma.ad.count({
        where: {
          announcerId: announcer.id,
          itemType: 'App\\Models\\RealEstate',
        },
      }),
      this.prisma.ad.count({
        where: {
          announcerId: announcer.id,
          itemType: 'App\\Models\\Furniture',
        },
      }),
    ]);

    return {
      id: announcer.id,
      name: announcer.name,
      user: {
        name: announcer.user.name,
        sex: announcer.user.sex,
        devise: announcer.user.devise,
        phone_number: announcer.user.phoneNumber,
        liked: 0,
        announcer: announcer.id,
      },
      avatar: storageUrl(announcer.avatar),
      contact: announcer.contact,
      email: announcer.user.email ?? null,
      creation_date: announcer.createdAt,
      bio: announcer.bio,
      verified: Boolean(announcer.verified),
      houses,
      furnitures,
    };
  }

  async index(query: QueryAnnouncersDto) {
    const page = Number(query.page || 1);
    const perPage = 10;

    const [announcers, total] = await Promise.all([
      this.prisma.announcer.findMany({
        include: { user: true },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.announcer.count(),
    ]);

    const data = await Promise.all(
      announcers.map((announcer) => this.serializeAnnouncer(announcer)),
    );

    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/announcers',
      query: query as object,
    });
  }

  async show(id: string) {
    const announcer = await this.prisma.announcer.findUniqueOrThrow({
      where: { id },
      include: { user: true },
    });

    return this.serializeAnnouncer(announcer);
  }

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Unauthorized');
    }
  }

  async create(user: any, dto: UpsertAnnouncerDto, avatar?: string) {
    this.ensureAdmin(user);
    const targetUserId = dto.user_id ? BigInt(dto.user_id) : user.id;
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('User not found');

    const announcer = await this.prisma.announcer.create({
      data: {
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        name: dto.name,
        userId: targetUserId,
        bio: dto.bio,
        contact: dto.contact,
        ...(avatar ? { avatar } : {}),
      },
      include: { user: true },
    });

    return this.serializeAnnouncer(announcer);
  }

  async update(user: any, id: string, dto: Partial<UpsertAnnouncerDto>, avatar?: string) {
    this.ensureAdmin(user);
    const announcer = await this.prisma.announcer.findUnique({ where: { id } });
    if (!announcer) throw new NotFoundException('Announcer not found');

    let userId = announcer.userId;
    if (dto.user_id) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: BigInt(dto.user_id) } });
      if (!targetUser) throw new NotFoundException('User not found');
      userId = targetUser.id;
    }

    const updated = await this.prisma.announcer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.contact !== undefined ? { contact: dto.contact } : {}),
        userId,
        ...(avatar ? { avatar } : {}),
      },
      include: { user: true },
    });

    return this.serializeAnnouncer(updated);
  }

  async destroy(user: any, id: string) {
    this.ensureAdmin(user);
    const announcer = await this.prisma.announcer.findUnique({ where: { id } });
    if (!announcer) throw new NotFoundException('Announcer not found');
    await this.prisma.announcer.delete({ where: { id } });
    return null;
  }
}
