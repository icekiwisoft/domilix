import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationCodeService {
  private readonly codes = new Map<string, { code: string; expiresAt: number }>();

  generate(key: string, ttlMinutes = 10) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.codes.set(key, {
      code,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    });
    return code;
  }

  get(key: string) {
    const entry = this.codes.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.codes.delete(key);
      return null;
    }
    return entry.code;
  }

  forget(key: string) {
    this.codes.delete(key);
  }
}
