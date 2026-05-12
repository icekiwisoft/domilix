import { BadRequestException, Logger } from '@nestjs/common';
import sharp from 'sharp';

const logger = new Logger('UploadSecurity');

const MAX_IMAGE_PIXELS = 25_000_000;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const allowedVideoMimeTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const startsWith = (buffer: Buffer, signature: number[]) =>
  signature.every((byte, index) => buffer[index] === byte);

const detectMimeType = (buffer: Buffer) => {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buffer.slice(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  if (buffer.slice(4, 8).toString('ascii') === 'ftyp') return 'video/mp4';
  if (startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return 'video/webm';
  return null;
};

export async function validateUploadedFile(file: any, options: {
  allowImages?: boolean;
  allowVideos?: boolean;
  maxSize: number;
  context: string;
}) {
  if (!file?.buffer?.length) {
    logger.warn(`${options.context}: empty upload rejected`);
    throw new BadRequestException('Fichier invalide.');
  }

  if (file.size > options.maxSize) {
    logger.warn(`${options.context}: oversized upload rejected (${file.size} bytes)`);
    throw new BadRequestException('Fichier trop volumineux.');
  }

  const detectedMimeType = detectMimeType(file.buffer);
  const declaredMimeType = file.mimetype;
  const imageAllowed = options.allowImages && detectedMimeType && allowedImageMimeTypes.has(detectedMimeType);
  const videoAllowed = options.allowVideos && detectedMimeType && allowedVideoMimeTypes.has(detectedMimeType);

  if (!detectedMimeType || (!imageAllowed && !videoAllowed)) {
    logger.warn(`${options.context}: unsupported upload rejected (${declaredMimeType || 'unknown'})`);
    throw new BadRequestException('Type de fichier non autorise.');
  }

  if (detectedMimeType.startsWith('image/')) {
    try {
      const metadata = await sharp(file.buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
      if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
        logger.warn(`${options.context}: image dimensions rejected (${metadata.width}x${metadata.height})`);
        throw new BadRequestException('Image trop grande.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      logger.warn(`${options.context}: invalid image payload rejected`);
      throw new BadRequestException('Image invalide.');
    }
  }

  if (detectedMimeType.startsWith('video/') && file.size > MAX_VIDEO_BYTES) {
    logger.warn(`${options.context}: video size rejected (${file.size} bytes)`);
    throw new BadRequestException('Video trop volumineuse.');
  }

  file.mimetype = detectedMimeType;
}
