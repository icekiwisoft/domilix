import { BadRequestException, Injectable } from '@nestjs/common';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { ALLOWED_MEDIA_MIME_PATTERN, generateMediaThumbnailBuffer } from '../common/media/thumbnails';

export type UploadType = 'media' | 'avatar' | 'presentation-image';

const uploadRules: Record<UploadType, { folder: string; maxSize: number; pattern: RegExp }> = {
  media: { folder: 'medias', maxSize: 50 * 1024 * 1024, pattern: ALLOWED_MEDIA_MIME_PATTERN },
  avatar: { folder: 'avatars', maxSize: 5 * 1024 * 1024, pattern: /^image\// },
  'presentation-image': { folder: 'presentations', maxSize: 10 * 1024 * 1024, pattern: /^image\// },
};

@Injectable()
export class UploadsService {
  constructor(private readonly objectStorage: ObjectStorageService) {}

  async upload(type: UploadType, file: any) {
    const rule = uploadRules[type];
    if (!rule) throw new BadRequestException('Type d upload invalide.');
    if (!rule.pattern.test(file.mimetype)) throw new BadRequestException('Type de fichier non autorise.');
    if (file.size > rule.maxSize) throw new BadRequestException('Fichier trop volumineux.');

    const url = await this.objectStorage.uploadFile(file, rule.folder);
    let thumbnail: string | null = null;

    if (type === 'media') {
      const thumbnailBuffer = await generateMediaThumbnailBuffer(file).catch(() => null);
      thumbnail = thumbnailBuffer
        ? await this.objectStorage.uploadThumbnail(thumbnailBuffer, file).catch(() => url)
        : url;
    }

    return {
      url,
      thumbnail,
      type,
      mime_type: file.mimetype,
      size: file.size,
      original_name: file.originalname,
    };
  }
}
