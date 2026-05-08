import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import path from 'node:path';

type UploadableFile = {
  originalname?: string;
  filename?: string;
  mimetype: string;
  buffer: Buffer;
};

export type StoredObject = {
  bucket: string;
  path: string;
  url: string;
};

@Injectable()
export class ObjectStorageService {
  private readonly bucketName = process.env.WASABI_BUCKET;
  private readonly endpoint = process.env.WASABI_ENDPOINT;
  private readonly publicBaseUrl = process.env.WASABI_PUBLIC_BASE_URL;
  private readonly signedUrlTtlSeconds = Number(process.env.WASABI_SIGNED_URL_TTL_SECONDS || 3600);
  private client?: S3Client;

  private get storageClient() {
    this.client ??= this.createClient();
    return this.client;
  }

  private createClient() {
    const accessKeyId = process.env.WASABI_ACCESS_KEY_ID;
    const secretAccessKey = process.env.WASABI_SECRET_ACCESS_KEY;
    const region = process.env.WASABI_REGION;

    if (!accessKeyId || !secretAccessKey || !region || !this.endpoint || !this.bucketName) {
      throw new InternalServerErrorException('Wasabi storage is not configured.');
    }

    return new S3Client({
      region,
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private makeStoragePath(folder: string, file: Pick<UploadableFile, 'originalname' | 'filename'>, extensionOverride?: string) {
    const sourceName = file.originalname || file.filename || '';
    const extension = extensionOverride || path.extname(sourceName) || '';
    return `${folder}/${Date.now()}-${crypto.randomUUID()}${extension}`;
  }

  private publicUrl(destination: string) {
    const encodedDestination = encodeURIComponent(destination).replace(/%2F/g, '/');

    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${encodedDestination}`;
    }

    return `${this.endpoint!.replace(/\/$/, '')}/${this.bucketName}/${encodedDestination}`;
  }

  async uploadBuffer(buffer: Buffer, destination: string, contentType: string) {
    await this.storageClient.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: destination,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      ACL: 'public-read',
    }));

    return {
      bucket: this.bucketName!,
      path: destination,
      url: this.publicUrl(destination),
    };
  }

  async getSignedUrl(bucket: string | null | undefined, path: string | null | undefined) {
    if (!bucket || !path) return null;

    return getSignedUrl(
      this.storageClient,
      new GetObjectCommand({
        Bucket: bucket,
        Key: path,
      }),
      { expiresIn: this.signedUrlTtlSeconds },
    );
  }

  async uploadFile(file: UploadableFile, folder: string) {
    return this.uploadBuffer(
      file.buffer,
      this.makeStoragePath(folder, file),
      file.mimetype,
    );
  }

  async uploadThumbnail(buffer: Buffer, sourceFile: Pick<UploadableFile, 'originalname' | 'filename'>, folder = 'thumbnails') {
    return this.uploadBuffer(
      buffer,
      this.makeStoragePath(folder, sourceFile, '.webp'),
      'image/webp',
    );
  }
}
