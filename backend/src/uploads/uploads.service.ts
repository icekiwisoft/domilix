import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import crypto from 'node:crypto';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { ALLOWED_MEDIA_MIME_PATTERN, generateMediaThumbnailBuffer } from '../common/media/thumbnails';
import { PrismaService } from '../prisma/prisma.service';

export type UploadType = 'media' | 'avatar' | 'presentation-image';
const uploadPurpose: Record<UploadType, string> = {
  media: 'ad_media',
  avatar: 'avatar',
  'presentation-image': 'presentation',
};

const uploadRules: Record<UploadType, { folder: string; maxSize: number; pattern: RegExp }> = {
  media: { folder: 'medias', maxSize: 50 * 1024 * 1024, pattern: ALLOWED_MEDIA_MIME_PATTERN },
  avatar: { folder: 'avatars', maxSize: 5 * 1024 * 1024, pattern: /^image\// },
  'presentation-image': { folder: 'presentations', maxSize: 10 * 1024 * 1024, pattern: /^image\// },
};

@Injectable()
export class UploadsService {
  constructor(
    private readonly objectStorage: ObjectStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async upload(user: any, type: UploadType, file: any) {
    const rule = uploadRules[type];
    if (!rule) throw new BadRequestException('Type d upload invalide.');
    if (!rule.pattern.test(file.mimetype)) throw new BadRequestException('Type de fichier non autorise.');
    if (file.size > rule.maxSize) throw new BadRequestException('Fichier trop volumineux.');

    const announcer = await this.prisma.announcer.findFirst({ where: { userId: user.id } });
    if (!announcer) throw new UnauthorizedException('Announcer not found');

    const uploaded = await this.objectStorage.uploadFile(file, rule.folder);
    let thumbnail = uploaded;

    if (type === 'media') {
      const thumbnailBuffer = await generateMediaThumbnailBuffer(file).catch(() => null);
      thumbnail = thumbnailBuffer
        ? await this.objectStorage.uploadThumbnail(thumbnailBuffer, file).catch(() => uploaded)
        : uploaded;
    }

    const media = await this.prisma.media.create({
      data: {
        id: crypto.randomUUID(),
        file: uploaded.url,
        thumbnail: type === 'media' ? thumbnail.url : uploaded.url,
        bucket: uploaded.bucket,
        originalPath: uploaded.path,
        thumbnailPath: type === 'media' ? thumbnail.path : null,
        purpose: uploadPurpose[type],
        size: file.size,
        originalName: file.originalname,
        type: file.mimetype,
        announcerId: announcer.id,
      },
    });

    return {
      id: media.id,
      type,
      purpose: media.purpose,
      mime_type: media.type,
      size: media.size,
      original_name: media.originalName,
    };
  }
}
