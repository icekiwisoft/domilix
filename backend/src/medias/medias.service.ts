import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { storageUrl } from '../common/http/formatters';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { generateMediaThumbnailBuffer } from '../common/media/thumbnails';

@Injectable()
export class MediasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  private async createObjectStorageMedia(file: any, announcerId: string) {
    const uploaded = await this.objectStorage.uploadFile(file, 'medias');
    const thumbnailBuffer = await generateMediaThumbnailBuffer(file).catch(() => null);
    const thumbnail = thumbnailBuffer
      ? await this.objectStorage.uploadThumbnail(thumbnailBuffer, file).catch(() => null)
      : null;

    return this.prisma.media.create({
      data: {
        id: crypto.randomUUID(),
        file: uploaded.url,
        thumbnail: thumbnail?.url || '',
        bucket: uploaded.bucket,
        originalPath: uploaded.path,
        thumbnailPath: thumbnail?.path || null,
        purpose: 'ad_media',
        size: file.size,
        originalName: file.originalname,
        type: file.mimetype,
        announcerId,
      },
    });
  }

  private async serializeAnnouncer(announcerId: string) {
    const announcer = await this.prisma.announcer.findUnique({
      where: { id: announcerId },
      include: { user: true },
    });
    if (!announcer) return null;

    const [houses, furnitures, avatarMedia] = await Promise.all([
      this.prisma.ad.count({ where: { announcerId, itemType: 'App\\Models\\RealEstate' } }),
      this.prisma.ad.count({ where: { announcerId, itemType: 'App\\Models\\Furniture' } }),
      announcer.avatarMediaId
        ? this.prisma.media.findUnique({ where: { id: announcer.avatarMediaId } })
        : Promise.resolve(null),
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
      avatar: await this.objectStorage.getSignedUrl(avatarMedia?.bucket || announcer.avatarBucket, avatarMedia?.originalPath || announcer.avatarPath) || storageUrl(announcer.avatar),
      avatar_media_id: announcer.avatarMediaId,
      avatar_bucket: announcer.avatarBucket,
      avatar_path: announcer.avatarPath,
      contact: announcer.contact,
      email: announcer.user.email ?? null,
      creation_date: announcer.createdAt,
      bio: announcer.bio,
      verified: Boolean(announcer.verified),
      houses,
      furnitures,
    };
  }

  private async serializeMedia(media: any) {
    const signedFile = await this.objectStorage.getSignedUrl(media.bucket, media.originalPath);
    const signedThumbnail = media.thumbnailPath && media.thumbnailPath !== media.originalPath
      ? await this.objectStorage.getSignedUrl(media.bucket, media.thumbnailPath)
      : null;
    const [announcer, ads] = await Promise.all([
      this.serializeAnnouncer(media.announcerId),
      this.prisma.adMedia.count({ where: { mediaId: media.id } }),
    ]);

    return {
      id: media.id,
      file: signedFile || storageUrl(media.file),
      thumbnail: signedThumbnail || storageUrl(media.thumbnail),
      type: media.type,
      announcer,
      ads,
    };
  }

  async index(query: { AnnounceId?: string; AnnouncerId?: string; page?: string }) {
    const page = Number(query.page || 1);
    const perPage = 15;

    if (query.AnnounceId) {
      const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(query.AnnounceId) } });
      if (!ad) throw new NotFoundException('Ad not found');

      const [links, total] = await Promise.all([
        this.prisma.adMedia.findMany({
          where: { adId: query.AnnounceId },
          orderBy: [{ isPresentation: 'desc' }, { id: 'asc' }],
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        this.prisma.adMedia.count({ where: { adId: query.AnnounceId } }),
      ]);

      const medias = await this.prisma.media.findMany({
        where: { id: { in: links.map((item) => item.mediaId) } },
      });
      const byId = new Map(medias.map((item) => [item.id, item] as const));
      const data = await Promise.all(
        links.map((link) => this.serializeMedia(byId.get(link.mediaId))),
      );
      return buildLaravelPagination(data, {
        total,
        page,
        perPage,
        path: '/medias',
        query,
      });
    }

    const where = query.AnnouncerId ? { announcerId: query.AnnouncerId } : {};
    const [medias, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.media.count({ where }),
    ]);

    const data = await Promise.all(medias.map((media) => this.serializeMedia(media)));
    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/medias',
      query,
    });
  }

  async show(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return this.serializeMedia(media);
  }

  async indexByAnnouncer(announcerId: string, page = 1) {
    const announcer = await this.prisma.announcer.findUnique({
      where: { id: announcerId },
    });
    if (!announcer) throw new NotFoundException('Announcer not found');

    return this.index({ AnnouncerId: announcerId, page: String(page) });
  }

  async store(
    currentUser: any,
    payload: { AdId?: string; filesid?: string[]; media_ids?: string[]; media_urls?: string[]; media_thumbnails?: string[]; media_types?: string[]; media_buckets?: string[]; media_original_paths?: string[]; media_thumbnail_paths?: string[] },
    files: Array<{ filename: string; mimetype: string }> = [],
  ) {
    if (!currentUser) throw new UnauthorizedException('User not authenticated');
    const announcer = await this.prisma.announcer.findFirst({
      where: { userId: currentUser.id },
    });
    if (!announcer) throw new UnauthorizedException('Announcer not found');

    if (payload.AdId) {
      const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(payload.AdId) } });
      if (!ad) throw new NotFoundException('Ad not found');

      const createdIds: string[] = [];
      const existingMediaIds = [...(payload.filesid || []), ...(payload.media_ids || [])];
      if (existingMediaIds.length) {
        const ownedMedias = await this.prisma.media.findMany({
          where: {
            id: { in: existingMediaIds },
            announcerId: announcer.id,
            purpose: 'ad_media',
          },
          select: { id: true },
        });
        if (ownedMedias.length !== new Set(existingMediaIds).size) {
          throw new UnauthorizedException('Invalid media');
        }
      }

      for (const [index, mediaUrl] of (payload.media_urls || []).entries()) {
        const media = await this.prisma.media.create({
          data: {
            id: crypto.randomUUID(),
            file: mediaUrl,
            thumbnail: payload.media_thumbnails?.[index] || mediaUrl,
            bucket: payload.media_buckets?.[index] || null,
            originalPath: payload.media_original_paths?.[index] || null,
            thumbnailPath: payload.media_thumbnail_paths?.[index] || payload.media_original_paths?.[index] || null,
            purpose: 'ad_media',
            type: payload.media_types?.[index] || 'application/octet-stream',
            announcerId: announcer.id,
          },
        });
        createdIds.push(media.id);
      }

      for (const file of files) {
        const media = await this.createObjectStorageMedia(file, announcer.id);
        createdIds.push(media.id);
      }

      const attachIds = [...createdIds, ...existingMediaIds];
      for (const [index, mediaId] of attachIds.entries()) {
        const exists = await this.prisma.adMedia.findFirst({
          where: { adId: payload.AdId, mediaId },
        });
        if (!exists) {
          await this.prisma.adMedia.create({
            data: {
              adId: payload.AdId,
              mediaId,
              isPresentation: index === 0,
            },
          });
        }
      }

      const medias = await this.prisma.media.findMany({ where: { id: { in: attachIds } } });
      return Promise.all(medias.map((media) => this.serializeMedia(media)));
    }

    const created: any[] = [];
    for (const [index, mediaUrl] of (payload.media_urls || []).entries()) {
      created.push(
        await this.prisma.media.create({
          data: {
            id: crypto.randomUUID(),
            file: mediaUrl,
            thumbnail: payload.media_thumbnails?.[index] || mediaUrl,
            bucket: payload.media_buckets?.[index] || null,
            originalPath: payload.media_original_paths?.[index] || null,
            thumbnailPath: payload.media_thumbnail_paths?.[index] || payload.media_original_paths?.[index] || null,
            purpose: 'ad_media',
            type: payload.media_types?.[index] || 'application/octet-stream',
            announcerId: announcer.id,
          },
        }),
      );
    }

    for (const file of files) {
      created.push(await this.createObjectStorageMedia(file, announcer.id));
    }
    return Promise.all(created.map((media) => this.serializeMedia(media)));
  }

  async destroy(id: string, adId?: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    if (adId) {
      await this.prisma.adMedia.deleteMany({ where: { adId, mediaId: id } });
      return { message: 'Media detached from ad successfully' };
    }

    await this.prisma.adMedia.deleteMany({ where: { mediaId: id } });
    await this.prisma.media.delete({ where: { id } });
    return { message: 'Media deleted successfully' };
  }
}
