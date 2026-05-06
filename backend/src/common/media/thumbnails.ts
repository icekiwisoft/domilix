import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';

const mediaDir = path.join(process.cwd(), 'storage', 'medias');
const thumbnailDir = path.join(process.cwd(), 'storage', 'thumbnails');

export const MAX_AD_MEDIAS = 10;
export const ALLOWED_MEDIA_MIME_PATTERN = /^(image|video)\//;

const thumbnailStoragePath = (filename: string) => {
  const parsed = path.parse(filename);
  return `public/thumbnails/${parsed.name}.jpg`;
};

const thumbnailDiskPath = (filename: string) => {
  const parsed = path.parse(filename);
  return path.join(thumbnailDir, `${parsed.name}.jpg`);
};

const generateVideoThumbnail = async (inputPath: string, outputPath: string) => {
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

  await new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      '-y',
      '-ss',
      '00:00:01',
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=500:-1',
      outputPath,
    ]);

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
};

export const generateMediaThumbnail = async (file: {
  filename: string;
  mimetype: string;
}) => {
  const inputPath = path.join(mediaDir, file.filename);
  const outputPath = thumbnailDiskPath(file.filename);
  const storagePath = thumbnailStoragePath(file.filename);

  try {
    await fs.mkdir(thumbnailDir, { recursive: true });

    if (file.mimetype.startsWith('image/')) {
      await sharp(inputPath)
        .resize({ width: 500, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toFile(outputPath);
      return storagePath;
    }

    if (file.mimetype.startsWith('video/')) {
      await generateVideoThumbnail(inputPath, outputPath);
      return storagePath;
    }
  } catch {
    return `public/medias/${file.filename}`;
  }

  return `public/medias/${file.filename}`;
};
