import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdsService } from '../ads/ads.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
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
  private readonly logger = new Logger(PublicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adsService: AdsService,
    private readonly objectStorage: ObjectStorageService,
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

  private facebookApiUrl(path: string) {
    const version = process.env.FACEBOOK_GRAPH_API_VERSION || 'v21.0';
    return `https://graph.facebook.com/${version}/${path.replace(/^\/+/, '')}`;
  }

  private facebookPostUrl(postId: string) {
    return `https://www.facebook.com/${postId}`;
  }

  private async callFacebook(path: string, params: URLSearchParams) {
    const response = await fetch(this.facebookApiUrl(path), {
      method: 'POST',
      body: params,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        payload?.error?.error_user_msg ||
        `Facebook API error ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }

  private async mediaPublicUrl(media: any) {
    if (media.bucket && media.originalPath) {
      const signedUrl = await this.objectStorage.getSignedUrl(
        media.bucket,
        media.originalPath,
      );
      if (signedUrl) return signedUrl;
    }

    return media.file || null;
  }

  private async selectedMediaItems(item: any) {
    const mediaIds = Array.isArray(item.mediaIds)
      ? item.mediaIds.filter((mediaId) => typeof mediaId === 'string')
      : [];
    if (!mediaIds.length) return [];

    const medias = await this.prisma.media.findMany({
      where: { id: { in: mediaIds } },
    });
    const byId = new Map(medias.map((media) => [media.id, media]));

    return mediaIds
      .map((mediaId) => byId.get(mediaId))
      .filter((media): media is NonNullable<typeof media> => Boolean(media));
  }

  private async publishPhotoPost(
    item: any,
    medias: any[],
    accessToken: string,
    pageId: string,
  ) {
    const images = medias.filter(
      (media) => !String(media.type || '').toLowerCase().startsWith('video/'),
    );

    if (!images.length) {
      const params = new URLSearchParams({
        access_token: accessToken,
        message: item.message,
      });
      const payload = await this.callFacebook(`${pageId}/feed`, params);
      return String(payload.id);
    }

    const uploadedPhotoIds: string[] = [];
    for (const media of images) {
      const url = await this.mediaPublicUrl(media);
      if (!url) continue;

      const params = new URLSearchParams({
        access_token: accessToken,
        url,
        published: 'false',
      });
      const payload = await this.callFacebook(`${pageId}/photos`, params);
      uploadedPhotoIds.push(String(payload.id));
    }

    if (!uploadedPhotoIds.length) {
      throw new Error('Aucune image selectionnee ne contient une URL publiable.');
    }

    const params = new URLSearchParams({
      access_token: accessToken,
      message: item.message,
    });
    uploadedPhotoIds.forEach((photoId, index) => {
      params.append(
        `attached_media[${index}]`,
        JSON.stringify({ media_fbid: photoId }),
      );
    });

    const payload = await this.callFacebook(`${pageId}/feed`, params);
    return String(payload.id);
  }

  private async publishVideoPosts(
    item: any,
    medias: any[],
    accessToken: string,
    pageId: string,
  ) {
    const videos = medias.filter((media) =>
      String(media.type || '').toLowerCase().startsWith('video/'),
    );
    const postIds: string[] = [];

    for (const media of videos) {
      const fileUrl = await this.mediaPublicUrl(media);
      if (!fileUrl) continue;

      const params = new URLSearchParams({
        access_token: accessToken,
        file_url: fileUrl,
        description: item.message,
      });
      const payload = await this.callFacebook(`${pageId}/videos`, params);
      postIds.push(String(payload.id));
    }

    if (!postIds.length) {
      throw new Error('Aucune video selectionnee ne contient une URL publiable.');
    }

    return postIds[0];
  }

  private async publishToFacebook(item: any) {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!pageId || !accessToken) {
      throw new Error(
        'Integration Meta non configuree: FACEBOOK_PAGE_ID et FACEBOOK_PAGE_ACCESS_TOKEN sont requis.',
      );
    }

    const medias = await this.selectedMediaItems(item);
    const hasVideos =
      item.includeVideos &&
      medias.some((media) =>
        String(media.type || '').toLowerCase().startsWith('video/'),
      );

    return hasVideos
      ? this.publishVideoPosts(item, medias, accessToken, pageId)
      : this.publishPhotoPost(item, medias, accessToken, pageId);
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

    const publishing = await this.prisma.facebookPublication.update({
      where: { id: existing.id },
      data: {
        status: 'publishing',
        error: null,
      },
    });

    try {
      const facebookPostId = await this.publishToFacebook(publishing);
      const item = await this.prisma.facebookPublication.update({
        where: { id: existing.id },
        data: {
          status: 'published',
          facebookPostId,
          facebookUrl: this.facebookPostUrl(facebookPostId),
          publishedAt: new Date(),
          error: null,
        },
      });

      return this.serialize(item);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur inconnue pendant la publication Facebook.';
      this.logger.error(`Facebook publication ${existing.id} failed: ${message}`);

      const item = await this.prisma.facebookPublication.update({
        where: { id: existing.id },
        data: {
          status: 'failed',
          error: message,
        },
      });
      return this.serialize(item);
    }
  }
}
