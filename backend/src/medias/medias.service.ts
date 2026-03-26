import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { storageUrl } from '../common/http/formatters';

@Injectable()
export class MediasService {
  constructor(private readonly prisma: PrismaService) {}

  private async serializeAnnouncer(announcerId: string) {
    const announcer = await this.prisma.announcer.findUnique({
      where: { id: announcerId },
      include: { user: true },
    });
    if (!announcer) return null;

    const [houses, furnitures] = await Promise.all([
      this.prisma.ad.count({ where: { announcerId, itemType: 'App\\Models\\RealEstate' } }),
      this.prisma.ad.count({ where: { announcerId, itemType: 'App\\Models\\Furniture' } }),
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
      avatar: announcer.avatar,
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
    const [announcer, ads] = await Promise.all([
      this.serializeAnnouncer(media.announcerId),
      this.prisma.adMedia.count({ where: { mediaId: media.id } }),
    ]);

    return {
      id: media.id,
      file: storageUrl(media.file),
      thumbnail: storageUrl(media.thumbnail),
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
    payload: { AdId?: string; filesid?: string[] },
    files: Array<{ filename: string; mimetype: string }> = [],
  ) {
    if (!currentUser) throw new UnauthorizedException('User not authenticated');
    const announcer = await this.prisma.announcer.findUnique({ where: { userId: currentUser.id } });
    if (!announcer) throw new UnauthorizedException('Announcer not found');

    if (payload.AdId) {
      const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(payload.AdId) } });
      if (!ad) throw new NotFoundException('Ad not found');

      const createdIds: string[] = [];
      for (const file of files) {
        const media = await this.prisma.media.create({
          data: {
            id: crypto.randomUUID(),
            file: `public/medias/${file.filename}`,
            thumbnail: `public/medias/${file.filename}`,
            type: file.mimetype,
            announcerId: announcer.id,
          },
        });
        createdIds.push(media.id);
      }

      const attachIds = [...createdIds, ...(payload.filesid || [])];
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
    for (const file of files) {
      created.push(
        await this.prisma.media.create({
          data: {
            id: crypto.randomUUID(),
            file: `public/medias/${file.filename}`,
            thumbnail: `public/medias/${file.filename}`,
            type: file.mimetype,
            announcerId: announcer.id,
          },
        }),
      );
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
