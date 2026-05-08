import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';

const thumbnailDir = path.join(process.cwd(), 'storage', 'thumbnails');

export const MAX_AD_MEDIAS = 10;
export const ALLOWED_MEDIA_MIME_PATTERN = /^(image|video)\//;

const thumbnailStoragePath = (filename: string) => {
  const parsed = path.parse(filename);
  return `public/thumbnails/${parsed.name}.webp`;
};

const thumbnailDiskPath = (filename: string) => {
  const parsed = path.parse(filename);
  return path.join(thumbnailDir, `${parsed.name}.webp`);
};

const generateVideoThumbnailFrame = async (inputPath: string, outputPath: string) => {
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

  await new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      '-y',
      '-loglevel',
      'error',
      '-ss',
      '00:00:01',
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=500:-1',
      outputPath,
    ], { stdio: 'ignore' });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ffmpeg thumbnail generation timed out'));
    }, 30000);

    child.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', code => {
      clearTimeout(timeout);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
};

export const generateMediaThumbnail = async (file: {
  filename: string;
  mimetype: string;
}) => {
  const mediaDir = path.join(process.cwd(), 'storage', 'medias');
  const inputPath = path.join(mediaDir, file.filename);
  const outputPath = thumbnailDiskPath(file.filename);
  const storagePath = thumbnailStoragePath(file.filename);

  try {
    await fs.mkdir(thumbnailDir, { recursive: true });

    if (file.mimetype.startsWith('image/')) {
      await sharp(inputPath)
        .resize({ width: 500, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);
      return storagePath;
    }

    if (file.mimetype.startsWith('video/')) {
      const framePath = path.join(thumbnailDir, `${path.parse(file.filename).name}-${Date.now()}.jpg`);
      try {
        await generateVideoThumbnailFrame(inputPath, framePath);
        await sharp(framePath)
          .webp({ quality: 82 })
          .toFile(outputPath);
      } finally {
        await fs.rm(framePath, { force: true });
      }
      return storagePath;
    }
  } catch {
    return `public/medias/${file.filename}`;
  }

  return `public/medias/${file.filename}`;
};

export const generateMediaThumbnailBuffer = async (file: {
  originalname?: string;
  filename?: string;
  mimetype: string;
  buffer: Buffer;
}) => {
  if (file.mimetype.startsWith('image/')) {
    return sharp(file.buffer)
      .resize({ width: 500, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  }

  if (!file.mimetype.startsWith('video/')) return null;

  const extension = path.extname(file.originalname || file.filename || '.mp4') || '.mp4';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'domilix-video-'));
  const inputPath = path.join(tempDir, `input${extension}`);
  const outputPath = path.join(tempDir, 'thumbnail.jpg');

  try {
    await fs.writeFile(inputPath, file.buffer);
    await generateVideoThumbnailFrame(inputPath, outputPath);
    return sharp(outputPath)
      .webp({ quality: 82 })
      .toBuffer();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};
