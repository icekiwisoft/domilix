import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { QueryBroadcastsDto } from './dto/query-broadcasts.dto';

@Injectable()
export class BroadcastsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Unauthorized');
    }
  }

  private serialize(item: any) {
    return {
      id: Number(item.id),
      title: item.title,
      subtitle: item.subtitle,
      chip: item.chip,
      badge: item.badge,
      cta: item.cta,
      image: item.image,
      bg: item.bg,
      action_url: item.actionUrl,
      active: item.active,
      position: item.position,
      starts_at: item.startsAt,
      ends_at: item.endsAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  async index(query: QueryBroadcastsDto) {
    const now = new Date();
    const includeInactive = query.include_inactive === true;

    const items = await this.prisma.broadcast.findMany({
      where: includeInactive
        ? {}
        : {
            active: true,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
          },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return items.map((item) => this.serialize(item));
  }

  async show(id: string) {
    const item = await this.prisma.broadcast.findUnique({
      where: { id: BigInt(id) },
    });
    if (!item) throw new NotFoundException('Broadcast not found');
    return this.serialize(item);
  }

  async create(user: any, dto: CreateBroadcastDto) {
    this.ensureAdmin(user);
    const item = await this.prisma.broadcast.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        chip: dto.chip,
        badge: dto.badge,
        cta: dto.cta,
        image: dto.image,
        bg: dto.bg,
        actionUrl: dto.action_url,
        active: dto.active ?? true,
        position: dto.position ?? 0,
        startsAt: dto.starts_at ? new Date(dto.starts_at) : null,
        endsAt: dto.ends_at ? new Date(dto.ends_at) : null,
      },
    });
    return this.serialize(item);
  }

  async update(user: any, id: string, dto: CreateBroadcastDto) {
    this.ensureAdmin(user);
    const existing = await this.prisma.broadcast.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Broadcast not found');

    const item = await this.prisma.broadcast.update({
      where: { id: existing.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
        ...(dto.chip !== undefined ? { chip: dto.chip } : {}),
        ...(dto.badge !== undefined ? { badge: dto.badge } : {}),
        ...(dto.cta !== undefined ? { cta: dto.cta } : {}),
        ...(dto.image !== undefined ? { image: dto.image } : {}),
        ...(dto.bg !== undefined ? { bg: dto.bg } : {}),
        ...(dto.action_url !== undefined ? { actionUrl: dto.action_url } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.starts_at !== undefined
          ? { startsAt: dto.starts_at ? new Date(dto.starts_at) : null }
          : {}),
        ...(dto.ends_at !== undefined
          ? { endsAt: dto.ends_at ? new Date(dto.ends_at) : null }
          : {}),
      },
    });
    return this.serialize(item);
  }

  async destroy(user: any, id: string) {
    this.ensureAdmin(user);
    const existing = await this.prisma.broadcast.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Broadcast not found');
    await this.prisma.broadcast.delete({ where: { id: existing.id } });
    return null;
  }
}
