import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import type { StoredObject } from '../common/object-storage/object-storage.service';
import {
  ALLOWED_MEDIA_MIME_PATTERN,
  generateMediaThumbnailBuffer,
} from '../common/media/thumbnails';
import { validateUploadedFile } from '../common/media/validate-upload';
import { PrismaService } from '../prisma/prisma.service';

export type UploadType = 'media' | 'avatar' | 'presentation-image' | 'broadcast-image';
const uploadPurpose: Record<UploadType, string> = {
  media: 'ad_media',
  avatar: 'avatar',
  'presentation-image': 'presentation',
  'broadcast-image': 'broadcast',
};

const uploadRules: Record<
  UploadType,
  { folder: string; maxSize: number; pattern: RegExp }
> = {
  media: {
    folder: 'medias',
    maxSize: 50 * 1024 * 1024,
    pattern: ALLOWED_MEDIA_MIME_PATTERN,
  },
  avatar: { folder: 'avatars', maxSize: 5 * 1024 * 1024, pattern: /^image\// },
  'presentation-image': {
    folder: 'presentations',
    maxSize: 10 * 1024 * 1024,
    pattern: /^image\//,
  },
  'broadcast-image': {
    folder: 'broadcasts',
    maxSize: 10 * 1024 * 1024,
    pattern: /^image\//,
  },
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
    if (!rule.pattern.test(file.mimetype))
      throw new BadRequestException('Type de fichier non autorise.');
    await validateUploadedFile(file, {
      allowImages: true,
      allowVideos: type === 'media',
      maxSize: rule.maxSize,
      context: `uploads.${type}`,
    });

    /* Broadcast images don't require an announcer profile */
    if (type !== 'broadcast-image') {
      const announcer = await this.prisma.announcer.findFirst({
        where: { userId: user.id },
      });
      if (!announcer) throw new UnauthorizedException('Announcer not found');
    }

    const uploaded = await this.objectStorage.uploadFile(file, rule.folder);
    let thumbnail: StoredObject | null = null;

    if (type === 'media') {
      const thumbnailBuffer = await generateMediaThumbnailBuffer(file).catch(
        () => null,
      );
      thumbnail = thumbnailBuffer
        ? await this.objectStorage
            .uploadThumbnail(thumbnailBuffer, file)
            .catch(() => null)
        : null;
    }

    if (type === 'broadcast-image') {
      return {
        url: uploaded.url,
        path: uploaded.path,
        type,
        mime_type: file.mimetype,
        original_name: file.originalname,
      };
    }

    const announcer = await this.prisma.announcer.findFirst({
      where: { userId: user.id },
    });

    const media = await this.prisma.media.create({
      data: {
        id: crypto.randomUUID(),
        file: uploaded.url,
        thumbnail: thumbnail?.url || '',
        bucket: uploaded.bucket,
        originalPath: uploaded.path,
        thumbnailPath: thumbnail?.path || null,
        purpose: uploadPurpose[type],
        size: file.size,
        originalName: file.originalname,
        type: file.mimetype,
        announcerId: announcer!.id,
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
