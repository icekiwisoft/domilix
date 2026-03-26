import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { UpdateAnnouncerProfileDto } from './dto/update-announcer-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerificationCodeService } from './verification-code.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: AuthTokenService,
    private readonly verificationCodes: VerificationCodeService,
  ) {}

  private async totalCreditsForUser(userId: bigint) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        credits: { gt: 0 },
        expireAt: { gt: new Date() },
      },
      select: { credits: true },
    });

    return subscriptions.reduce((sum, item) => sum + item.credits, 0);
  }

  private async userResource(user: User) {
    const [favorites, unlocked, announcer, credits] = await Promise.all([
      this.prisma.favorite.count({ where: { userId: user.id } }),
      this.prisma.unlocking.count({
        where: { userId: user.id, expiresAt: { gt: new Date() } },
      }),
      this.prisma.announcer.findFirst({ where: { userId: user.id } }),
      this.totalCreditsForUser(user.id),
    ]);

    return {
      id: Number(user.id),
      name: user.name,
      sex: user.sex,
      devise: user.devise,
      phone_number: user.phoneNumber,
      email: user.email,
      phone_verified: user.phoneVerified,
      liked: favorites,
      announcer: announcer?.id || null,
      credits,
      unlocked,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  private authResponse(user: User, message?: string) {
    const { accessToken, refreshToken } = this.tokens.issueTokens(user);

    return this.userResource(user).then((serializedUser) => ({
      ...(message ? { status: 'success', message } : {}),
      user: serializedUser,
      authorisation: {
        token: accessToken,
        refresh_token: refreshToken,
        type: 'bearer',
      },
    }));
  }

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone_number) {
      throw new BadRequestException('Email ou numero de telephone requis.');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findFirst({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException({ status: 'error', message: 'Validation failed', errors: { email: ['The email has already been taken.'] } });
      }
    }

    if (dto.phone_number) {
      const existingPhone = await this.prisma.user.findFirst({ where: { phoneNumber: dto.phone_number } });
      if (existingPhone) {
        throw new BadRequestException({ status: 'error', message: 'Validation failed', errors: { phone_number: ['The phone number has already been taken.'] } });
      }
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email || `temp_${crypto.randomUUID()}@domilix.local`,
        phoneNumber: dto.phone_number || crypto.randomUUID().replace(/-/g, '').slice(0, 12),
        password,
        phoneVerified: false,
        emailVerified: false,
      },
    });

    const code = this.verificationCodes.generate(`verification_code_${user.id}`);
    const message = dto.phone_number
      ? 'Un SMS de verification a ete envoye.'
      : 'Un email de verification a ete envoye.';

    const response = await this.authResponse(user, message);
    return {
      ...response,
      verification_code: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone_number) {
      throw new BadRequestException('Email ou numero de telephone requis.');
    }

    const user = await this.prisma.user.findFirst({
      where: dto.email ? { email: dto.email } : { phoneNumber: dto.phone_number! },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Les informations de connexion sont incorrectes.');
    }

    if (dto.phone_number && !user.phoneVerified) {
      throw new ForbiddenException("Le numero de telephone n'est pas verifie.");
    }

    if (dto.email && !user.emailVerified && !user.phoneVerified) {
      throw new ForbiddenException("Votre compte n'est pas verifie.");
    }

    return this.authResponse(user);
  }

  async refresh(refreshTokenOrAccessToken?: string, isAccessToken = false) {
    if (!refreshTokenOrAccessToken) {
      throw new BadRequestException('Refresh token manquant.');
    }

    const payload = isAccessToken
      ? this.tokens.decodeAccessToken(refreshTokenOrAccessToken)
      : this.tokens.verifyRefreshToken(refreshTokenOrAccessToken);
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(payload.sub) } });
    if (!user) {
      throw new UnauthorizedException('Non authentifie.');
    }

    if (!isAccessToken) {
      this.tokens.revokeRefreshToken(refreshTokenOrAccessToken);
    }
    const response = await this.authResponse(user, 'success');
    return {
      status: 'success',
      user: response.user,
      authorisation: response.authorisation,
    };
  }

  async profile(user: User) {
    return {
      status: 'success',
      user: await this.userResource(user),
    };
  }

  async logout(accessToken?: string, refreshToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Non authentifie.');
    }

    this.tokens.revokeAccessToken(accessToken);
    if (refreshToken) this.tokens.revokeRefreshToken(refreshToken);
    return null;
  }

  async resendVerificationCode(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new NotFoundException('Utilisateur non trouve.');
    if (user.phoneVerified) {
      throw new BadRequestException('Le numero de telephone est deja verifie.');
    }

    const code = this.verificationCodes.generate(`verification_code_${user.id}`);
    return {
      message: 'Un nouveau SMS de verification a ete envoye.',
      verification_code: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyPhone(userId: string, verificationCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new NotFoundException('Utilisateur non trouve.');

    const cachedCode = this.verificationCodes.get(`verification_code_${user.id}`);
    if (!cachedCode) {
      throw new BadRequestException('Le code de verification a expire.');
    }

    if (verificationCode !== cachedCode) {
      throw new BadRequestException('Code de verification incorrect.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });
    this.verificationCodes.forget(`verification_code_${user.id}`);
    return { message: 'Verification reussie, votre compte est active.' };
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
      if (existing) {
        throw new BadRequestException({ status: 'error', message: 'Validation failed', errors: { email: ['The email has already been taken.'] } });
      }
    }

    if (dto.phone_number && dto.phone_number !== user.phoneNumber) {
      const existing = await this.prisma.user.findFirst({ where: { phoneNumber: dto.phone_number } });
      if (existing) {
        throw new BadRequestException({ status: 'error', message: 'Validation failed', errors: { phone_number: ['The phone number has already been taken.'] } });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined && dto.email !== null ? { email: dto.email } : {}),
        ...(dto.phone_number !== undefined ? { phoneNumber: dto.phone_number } : {}),
      },
    });

    return {
      status: 'success',
      message: 'Profil mis a jour avec succes',
      user: await this.userResource(updated),
    };
  }

  async updateAnnouncerProfile(user: User, dto: UpdateAnnouncerProfileDto, avatarPath?: string) {
    const announcer = await this.prisma.announcer.findFirst({ where: { userId: user.id } });
    if (!announcer) {
      throw new ForbiddenException("Vous n'etes pas un annonceur");
    }

    await this.prisma.announcer.update({
      where: { id: announcer.id },
      data: {
        ...(dto.company_name !== undefined ? { name: dto.company_name } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.professional_phone !== undefined ? { contact: dto.professional_phone } : {}),
        ...(avatarPath ? { avatar: avatarPath } : {}),
      },
    });

    const refreshed = await this.prisma.announcer.findUniqueOrThrow({
      where: { id: announcer.id },
      include: { user: true },
    });

    return {
      status: 'success',
      message: 'Profil annonceur mis a jour avec succes',
      announcer: {
        id: refreshed.id,
        name: refreshed.name,
        avatar: refreshed.avatar,
        bio: refreshed.bio,
        contact: refreshed.contact,
      },
    };
  }

  async sendResetLinkEmail(dto: SendResetLinkDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouve avec cet email.');
    }

    const code = this.verificationCodes.generate(`verification_code_${user.id}`);
    return {
      message: 'Un code de verification a ete envoye a votre email.',
      verification_code: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException('The password confirmation does not match.');
    }

    const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouve avec cet email.');
    }

    const code = this.verificationCodes.get(`verification_code_${user.id}`);
    if (code !== String(dto.code)) {
      throw new BadRequestException('Code de verification invalide.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(dto.password, 10) },
    });
    this.verificationCodes.forget(`verification_code_${user.id}`);
    return { message: 'Mot de passe reinitialise avec succes.' };
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const currentPassword = dto.current_password || dto.old_password;
    if (!currentPassword) {
      throw new BadRequestException('Mot de passe actuel requis.');
    }
    if (dto.new_password !== dto.new_password_confirmation) {
      throw new BadRequestException('The new password confirmation does not match.');
    }
    const currentUser = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const matches = await bcrypt.compare(currentPassword, currentUser.password);
    if (!matches) {
      throw new UnauthorizedException('L’ancien mot de passe est incorrect.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(dto.new_password, 10) },
    });

    return { message: 'Mot de passe modifie avec succes.' };
  }
}
