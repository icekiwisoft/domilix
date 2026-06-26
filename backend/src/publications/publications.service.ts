import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdsService } from '../ads/ads.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { QueryPublicationsDto } from './dto/query-publications.dto';

const PUBLICATION_STATUSES = [
  'draft',
  'pending',
  'publishing',
  'published',
  'failed',
];

@Injectable()
export class PublicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adsService: AdsService,
  ) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  private parsePositiveInteger(value: string | undefined, fallback: number) {
    const parsed = Number(value || fallback);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
  }

  private async serialize(item: any) {
    const ad = await this.adsService.show(item.adId).catch(() => null);

    return {
      id: Number(item.id),
      ad_id: item.adId,
      status: item.status,
      message: item.message,
      media_ids: Array.isArray(item.mediaIds) ? item.mediaIds : [],
      include_videos: Boolean(item.includeVideos),
      facebook_post_id: item.facebookPostId,
      facebook_url: item.facebookUrl,
      error: item.error,
      published_at: item.publishedAt,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      ad,
    };
  }

  private buildMessage(ad: any) {
    const category = ad.category?.name ? `${ad.category.name} - ` : '';
    const transaction = ad.ad_type === 'sale' ? 'A vendre' : 'A louer';
    const city = ad.city ? ` a ${ad.city}` : '';
    const price = ad.price
      ? `${Number(ad.price).toLocaleString('fr-FR')} ${ad.devise || 'FCFA'}`
      : 'Prix sur demande';
    const description = ad.description
      ? String(ad.description).replace(/\s+/g, ' ').trim().slice(0, 220)
      : '';
    const url = `${process.env.FRONTEND_URL || 'https://domilix.com'}/announces/${ad.id}`;

    return [
      `${transaction}${city}`,
      `${category}${price}`,
      description,
      `Voir l'annonce: ${url}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  async index(user: any, query: QueryPublicationsDto) {
    this.ensureAdmin(user);
    const page = this.parsePositiveInteger(query.page, 1);
    const perPage = Math.min(this.parsePositiveInteger(query.per_page, 20), 100);
    const where: any = {};

    if (query.status && PUBLICATION_STATUSES.includes(query.status)) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      where.OR = [
        { adId: { contains: query.search.trim() } },
        { message: { contains: query.search.trim() } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.facebookPublication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.facebookPublication.count({ where }),
    ]);

    const data = await Promise.all(items.map((item) => this.serialize(item)));
    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/admin/publications',
      query,
    });
  }

  async show(user: any, id: string) {
    this.ensureAdmin(user);
    const item = await this.prisma.facebookPublication.findUnique({
      where: { id: BigInt(id) },
    });
    if (!item) throw new NotFoundException('Publication not found');
    return this.serialize(item);
  }

  async createDraft(user: any, dto: CreatePublicationDto) {
    this.ensureAdmin(user);
    if (!dto.ad_id) throw new BadRequestException('ad_id is required');

    const ad = await this.adsService.show(dto.ad_id);
    const medias = Array.isArray((ad as { medias?: unknown }).medias)
      ? ((ad as { medias: Array<{ id?: string }> }).medias)
      : [];
    const mediaIds =
      dto.media_ids && dto.media_ids.length
        ? dto.media_ids
        : medias
            .map((media) => media.id)
            .filter((mediaId): mediaId is string => Boolean(mediaId));

    const item = await this.prisma.facebookPublication.create({
      data: {
        adId: String(ad.id),
        status: 'draft',
        message: dto.message?.trim() || this.buildMessage(ad),
        mediaIds: mediaIds as Prisma.InputJsonValue,
        includeVideos: Boolean(dto.include_videos),
      },
    });

    return this.serialize(item);
  }

  async update(user: any, id: string, dto: CreatePublicationDto) {
    this.ensureAdmin(user);
    const existing = await this.prisma.facebookPublication.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Publication not found');
    if (existing.status === 'published') {
      throw new BadRequestException(
        'Une publication deja publiee ne peut pas etre modifiee.',
      );
    }

    const item = await this.prisma.facebookPublication.update({
      where: { id: existing.id },
      data: {
        ...(dto.message !== undefined ? { message: dto.message } : {}),
        ...(dto.media_ids !== undefined
          ? { mediaIds: dto.media_ids as Prisma.InputJsonValue }
          : {}),
        ...(dto.include_videos !== undefined
          ? { includeVideos: dto.include_videos }
          : {}),
      },
    });

    return this.serialize(item);
  }

  async publish(user: any, id: string) {
    this.ensureAdmin(user);
    const existing = await this.prisma.facebookPublication.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Publication not found');
    if (existing.status === 'published') return this.serialize(existing);

    const isConfigured =
      process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!isConfigured) {
      const item = await this.prisma.facebookPublication.update({
        where: { id: existing.id },
        data: {
          status: 'failed',
          error:
            'Integration Meta non configuree: FACEBOOK_PAGE_ID et FACEBOOK_PAGE_ACCESS_TOKEN sont requis.',
        },
      });
      return this.serialize(item);
    }

    const item = await this.prisma.facebookPublication.update({
      where: { id: existing.id },
      data: {
        status: 'pending',
        error: null,
      },
    });
    return this.serialize(item);
  }
}
