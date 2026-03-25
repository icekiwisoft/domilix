import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Non authentifie.');
    }

    const token = authorization.slice(7);
    const payload = this.tokens.verifyAccessToken(token);
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      include: { announcer: true },
    });

    if (!user) throw new UnauthorizedException('Non authentifie.');

    request.user = user;
    request.authToken = token;
    return true;
  }
}
