import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'node:crypto';

type AuthTokenPayload = JwtPayload & {
  sub: string;
  email?: string | null;
  name: string;
  is_admin: boolean;
  jti: string;
};

@Injectable()
export class AuthTokenService {
  private readonly secret = process.env.JWT_SECRET || 'domilix-dev-secret';
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET || 'domilix-dev-refresh-secret';
  private readonly revokedAccessTokens = new Map<string, number>();
  private readonly revokedRefreshTokens = new Map<string, number>();

  private now() {
    return Math.floor(Date.now() / 1000);
  }

  private cleanupRevokedStore(store: Map<string, number>) {
    const now = this.now();
    for (const [tokenId, exp] of store.entries()) {
      if (exp <= now) store.delete(tokenId);
    }
  }

  private createPayload(user: User, tokenId: string) {
    return {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      is_admin: Boolean(user.isAdmin),
      jti: tokenId,
    };
  }

  issueTokens(user: User) {
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();
    const accessToken = jwt.sign(this.createPayload(user, accessJti), this.secret, {
      expiresIn: '7d',
    });
    const refreshToken = jwt.sign(
      this.createPayload(user, refreshJti),
      this.refreshSecret,
      { expiresIn: '30d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    this.cleanupRevokedStore(this.revokedAccessTokens);
    const payload = jwt.verify(token, this.secret) as AuthTokenPayload;
    if (this.revokedAccessTokens.has(payload.jti)) {
      throw new UnauthorizedException('Token revoked');
    }
    return payload;
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    this.cleanupRevokedStore(this.revokedRefreshTokens);
    const payload = jwt.verify(token, this.refreshSecret) as AuthTokenPayload;
    if (this.revokedRefreshTokens.has(payload.jti)) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    return payload;
  }

  decodeAccessToken(token: string): AuthTokenPayload {
    const payload = jwt.decode(token) as AuthTokenPayload | null;
    if (!payload?.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid token');
    }
    if (this.revokedAccessTokens.has(payload.jti)) {
      throw new UnauthorizedException('Token revoked');
    }
    return payload;
  }

  revokeAccessToken(token: string) {
    const payload = jwt.decode(token) as AuthTokenPayload | null;
    if (payload?.jti && payload.exp) {
      this.revokedAccessTokens.set(payload.jti, payload.exp);
    }
  }

  revokeRefreshToken(token: string) {
    const payload = jwt.decode(token) as AuthTokenPayload | null;
    if (payload?.jti && payload.exp) {
      this.revokedRefreshTokens.set(payload.jti, payload.exp);
    }
  }
}
