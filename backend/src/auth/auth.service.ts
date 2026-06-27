import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { assertHoneypotClear } from '../common/honeypot';
import { MailService } from '../mail/mail.service';
import { AuthTokenService } from './auth-token.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { FirebaseAuthDto } from './dto/firebase-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetLinkDto } from './dto/send-reset-link.dto';
import { UpdateAnnouncerProfileDto } from './dto/update-announcer-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerificationCodeService } from './verification-code.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private firebaseCertsCache: {
    expiresAt: number;
    certs: Record<string, string>;
  } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: AuthTokenService,
    private readonly verificationCodes: VerificationCodeService,
    private readonly objectStorage: ObjectStorageService,
    private readonly mail: MailService,
  ) {}

  private async totalCreditsForUser(userId: bigint) {
    const now = new Date();

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        credits: { gt: 0 },
        OR: [
          { expireAt: { gt: now } },
          { AND: [{ expireAt: null }, { endDate: { gt: now } }] },
          { AND: [{ expireAt: null }, { endDate: null }] },
        ],
      },
      select: { credits: true },
    });

    return subscriptions.reduce((sum, item) => sum + item.credits, 0);
  }

  private verificationCodeKey(userId: bigint) {
    return `verification_code_${userId}`;
  }

  private emailVerificationKey(userId: bigint) {
    return `email_verification_code_${userId}`;
  }

  private async ensureSignupGiftPlan() {
    const existing = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Signup Gift' },
    });
    if (existing) return existing;

    return this.prisma.subscriptionPlan.create({
      data: { name: 'Signup Gift' },
    });
  }

  private async grantSignupGift(userId: bigint) {
    const signupGiftPlan = await this.ensureSignupGiftPlan();

    await this.prisma.subscription.create({
      data: {
        userId,
        subscriptionPlanId: String(signupGiftPlan.id),
        initialCredits: 2,
        credits: 2,
        price: 0,
        duration: 0,
        startDate: new Date(),
        endDate: null,
        expireAt: null,
      },
    });
  }

  private async createUserNotification(
    userId: bigint,
    data: {
      type: string;
      title: string;
      message: string;
      link?: string;
    },
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link,
        },
      });
    } catch {
      // Notifications should never block authentication flows.
    }
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
      email_verified: user.emailVerified,
      phone_verified: user.phoneVerified,
      liked: favorites,
      announcer: announcer?.id || null,
      credits,
      unlocked,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  private async ensureOwnedMedia(
    userId: bigint,
    mediaId: string | undefined,
    purpose: string,
  ) {
    if (!mediaId) return null;

    const announcer = await this.prisma.announcer.findFirst({
      where: { userId },
    });
    if (!announcer)
      throw new ForbiddenException("Vous n'etes pas un annonceur");

    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, announcerId: announcer.id, purpose },
    });
    if (!media) throw new BadRequestException('Media invalide.');

    return media;
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

  private firebaseProjectId() {
    if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    }

    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(
        process.cwd(),
        'domilix-firebase-adminsdk-fbsvc-39ea17bee0.json',
      );

    try {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8'),
      ) as { project_id?: string };
      return serviceAccount.project_id;
    } catch {
      return undefined;
    }
  }

  private async firebaseCertificates() {
    const now = Date.now();
    if (this.firebaseCertsCache && this.firebaseCertsCache.expiresAt > now) {
      return this.firebaseCertsCache.certs;
    }

    const response = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    );
    if (!response.ok) {
      throw new UnauthorizedException(
        'Impossible de verifier le token Firebase.',
      );
    }

    const cacheControl = response.headers.get('cache-control') || '';
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
    const certs = (await response.json()) as Record<string, string>;
    this.firebaseCertsCache = {
      certs,
      expiresAt: now + maxAge * 1000,
    };

    return certs;
  }

  private async verifyFirebaseIdToken(idToken: string) {
    const projectId = this.firebaseProjectId();
    if (!projectId) {
      throw new BadRequestException('FIREBASE_PROJECT_ID est requis.');
    }

    const decodedHeader = jwt.decode(idToken, { complete: true });
    const kid = decodedHeader?.header?.kid;
    if (!kid) {
      throw new UnauthorizedException('Token Firebase invalide.');
    }

    const certs = await this.firebaseCertificates();
    const cert = certs[kid];
    if (!cert) {
      throw new UnauthorizedException('Certificat Firebase introuvable.');
    }

    const payload = jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    }) as JwtPayload & {
      sub: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
      firebase?: { sign_in_provider?: string };
    };

    if (!payload.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException(
        'Le compte Firebase doit fournir un email verifie.',
      );
    }

    if (payload.firebase?.sign_in_provider !== 'google.com') {
      throw new UnauthorizedException('Connexion Google requise.');
    }

    return {
      uid: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
    };
  }

  async sendEmailVerification(user: User) {
    if (user.emailVerified) {
      return { message: 'Email deja verifie.' };
    }
    if (user.email.endsWith('@domilix.local')) {
      throw new BadRequestException(
        'Ajoutez une adresse email avant de la verifier.',
      );
    }

    const code = this.verificationCodes.generate(
      this.emailVerificationKey(user.id),
    );
    await this.mail.sendEmailVerificationCode(user.email, code);

    return {
      message: 'Un code de verification a ete envoye a votre email.',
      verification_code:
        process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyEmail(user: User, verificationCode: string) {
    const cachedCode = this.verificationCodes.get(
      this.emailVerificationKey(user.id),
    );
    if (!cachedCode) {
      throw new BadRequestException('Le code de verification a expire.');
    }
    if (verificationCode !== cachedCode) {
      throw new BadRequestException('Code de verification incorrect.');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
    this.verificationCodes.forget(this.emailVerificationKey(user.id));

    return {
      message: 'Email verifie avec succes.',
      user: await this.userResource(updated),
    };
  }

  async register(dto: RegisterDto) {
    assertHoneypotClear(dto.website, 'auth.register');

    if (!dto.email && !dto.phone_number) {
      throw new BadRequestException('Email ou numero de telephone requis.');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new BadRequestException({
          status: 'error',
          message: 'Validation failed',
          errors: { email: ['The email has already been taken.'] },
        });
      }
    }

    if (dto.phone_number) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phoneNumber: dto.phone_number },
      });
      if (existingPhone) {
        throw new BadRequestException({
          status: 'error',
          message: 'Validation failed',
          errors: {
            phone_number: ['The phone number has already been taken.'],
          },
        });
      }
    }

    if (dto.email && !dto.phone_number) {
      this.mail.ensureConfigured();
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email || `temp_${crypto.randomUUID()}@domilix.local`,
          phoneNumber:
            dto.phone_number ||
            crypto.randomUUID().replace(/-/g, '').slice(0, 12),
          password,
          phoneVerified: false,
          emailVerified: false,
          emailVerifiedAt: null,
        },
      });

      const signupGiftPlan =
        (await tx.subscriptionPlan.findFirst({
          where: { name: 'Signup Gift' },
        })) ||
        (await tx.subscriptionPlan.create({
          data: { name: 'Signup Gift' },
        }));
      await tx.subscription.create({
        data: {
          userId: created.id,
          subscriptionPlanId: String(signupGiftPlan.id),
          initialCredits: 2,
          credits: 2,
          price: 0,
          duration: 0,
          startDate: new Date(),
          endDate: null,
          expireAt: null,
        },
      });

      return created;
    });

    const code = this.verificationCodes.generate(
      dto.phone_number
        ? this.verificationCodeKey(user.id)
        : this.emailVerificationKey(user.id),
    );

    if (!dto.phone_number) {
      await this.mail.sendEmailVerificationCode(user.email, code);
    }

    await this.createUserNotification(user.id, {
      type: 'welcome',
      title: 'Bienvenue sur Domilix',
      message:
        'Votre compte a ete cree avec succes. Vous pouvez maintenant rechercher des annonces, sauvegarder vos favoris et configurer votre profil.',
      link: '/settings',
    });

    await this.createUserNotification(user.id, {
      type: 'signup_gift_received',
      title: '2 Domicoins offerts',
      message:
        'Bienvenue sur Domilix ! Vous recevez 2 Domicoins valables sans date d expiration pour debloquer vos premiers contacts.',
      link: '/settings?tab=packs',
    });

    const message = dto.phone_number
      ? 'Un SMS de verification a ete envoye.'
      : 'Un code de verification a ete envoye a votre email.';

    const response = await this.authResponse(user, message);
    return {
      ...response,
      verification_code:
        process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone_number) {
      throw new BadRequestException('Email ou numero de telephone requis.');
    }

    const user = await this.prisma.user.findFirst({
      where: dto.email
        ? { email: dto.email }
        : { phoneNumber: dto.phone_number! },
    });

    if (
      !user ||
      user.deletedAt ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      this.logger.warn(
        `Failed login attempt for ${dto.email || dto.phone_number || 'unknown'}`,
      );
      throw new UnauthorizedException(
        'Les informations de connexion sont incorrectes.',
      );
    }

    if (dto.phone_number && !user.phoneVerified) {
      throw new ForbiddenException("Le numero de telephone n'est pas verifie.");
    }

    await this.createUserNotification(user.id, {
      type: 'new_login',
      title: 'Nouvelle connexion',
      message:
        'Une nouvelle connexion a votre compte Domilix vient d etre effectuee.',
      link: '/settings',
    });

    return this.authResponse(user);
  }

  async firebaseLogin(dto: FirebaseAuthDto) {
    const firebaseUser = await this.verifyFirebaseIdToken(dto.id_token);
    const existing = await this.prisma.user.findUnique({
      where: { email: firebaseUser.email },
    });

    if (existing) {
      if (existing.deletedAt) {
        throw new UnauthorizedException('Ce compte a ete supprime.');
      }

      const updated = existing.emailVerified
        ? existing
        : await this.prisma.user.update({
            where: { id: existing.id },
            data: { emailVerified: true, emailVerifiedAt: new Date() },
          });

      await this.createUserNotification(updated.id, {
        type: 'new_login',
        title: 'Nouvelle connexion',
        message:
          'Une nouvelle connexion Google a votre compte Domilix vient d etre effectuee.',
        link: '/settings',
      });

      return this.authResponse(updated);
    }

    const password = await bcrypt.hash(crypto.randomUUID(), 10);
    const user = await this.prisma.user.create({
      data: {
        name: firebaseUser.name,
        email: firebaseUser.email,
        phoneNumber: `firebase_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`,
        password,
        phoneVerified: false,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await this.grantSignupGift(user.id);

    await this.createUserNotification(user.id, {
      type: 'welcome',
      title: 'Bienvenue sur Domilix',
      message:
        'Votre compte a ete cree avec Google. Vous pouvez maintenant rechercher des annonces, sauvegarder vos favoris et configurer votre profil.',
      link: '/settings',
    });

    await this.createUserNotification(user.id, {
      type: 'signup_gift_received',
      title: '2 Domicoins offerts',
      message:
        'Bienvenue sur Domilix ! Vous recevez 2 Domicoins valables sans date d expiration pour debloquer vos premiers contacts.',
      link: '/settings?tab=packs',
    });

    return this.authResponse(user, 'Connexion Google reussie.');
  }

  async refresh(refreshTokenOrAccessToken?: string, isAccessToken = false) {
    if (!refreshTokenOrAccessToken) {
      throw new BadRequestException('Refresh token manquant.');
    }

    const payload = isAccessToken
      ? this.tokens.decodeAccessToken(refreshTokenOrAccessToken)
      : this.tokens.verifyRefreshToken(refreshTokenOrAccessToken);
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
    });
    if (!user || user.deletedAt) {
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
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouve.');
    if (user.phoneVerified) {
      throw new BadRequestException('Le numero de telephone est deja verifie.');
    }

    const code = this.verificationCodes.generate(
      this.verificationCodeKey(user.id),
    );
    return {
      message: 'Un nouveau SMS de verification a ete envoye.',
      verification_code:
        process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyPhone(userId: string, verificationCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouve.');

    const cachedCode = this.verificationCodes.get(
      this.verificationCodeKey(user.id),
    );
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
    this.verificationCodes.forget(this.verificationCodeKey(user.id));
    return { message: 'Verification reussie, votre compte est active.' };
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (existing) {
        throw new BadRequestException({
          status: 'error',
          message: 'Validation failed',
          errors: { email: ['The email has already been taken.'] },
        });
      }
    }

    if (dto.phone_number && dto.phone_number !== user.phoneNumber) {
      const existing = await this.prisma.user.findFirst({
        where: { phoneNumber: dto.phone_number },
      });
      if (existing) {
        throw new BadRequestException({
          status: 'error',
          message: 'Validation failed',
          errors: {
            phone_number: ['The phone number has already been taken.'],
          },
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined && dto.email !== null
          ? {
              email: dto.email,
              emailVerified:
                dto.email === user.email ? user.emailVerified : false,
              emailVerifiedAt:
                dto.email === user.email ? user.emailVerifiedAt : null,
            }
          : {}),
        ...(dto.phone_number !== undefined
          ? { phoneNumber: dto.phone_number }
          : {}),
      },
    });

    return {
      status: 'success',
      message: 'Profil mis a jour avec succes',
      user: await this.userResource(updated),
    };
  }

  async updateAnnouncerProfile(
    user: User,
    dto: UpdateAnnouncerProfileDto,
    avatarPath?: string,
    presentationPath?: string,
  ) {
    const announcer = await this.prisma.announcer.findFirst({
      where: { userId: user.id },
    });
    if (!announcer) {
      throw new ForbiddenException("Vous n'etes pas un annonceur");
    }

    const [avatarMedia, presentationMedia] = await Promise.all([
      this.ensureOwnedMedia(user.id, dto.avatar_media_id, 'avatar'),
      this.ensureOwnedMedia(user.id, dto.presentation_media_id, 'presentation'),
    ]);

    await this.prisma.announcer.update({
      where: { id: announcer.id },
      data: {
        ...(dto.company_name !== undefined ? { name: dto.company_name } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.professional_phone !== undefined
          ? { contact: dto.professional_phone }
          : {}),
        ...(avatarPath ? { avatar: avatarPath } : {}),
        ...(dto.avatar_bucket && dto.avatar_path
          ? { avatarBucket: dto.avatar_bucket, avatarPath: dto.avatar_path }
          : {}),
        ...(avatarMedia
          ? {
              avatarMediaId: avatarMedia.id,
              avatar: avatarMedia.file,
              avatarBucket: avatarMedia.bucket,
              avatarPath: avatarMedia.originalPath,
            }
          : {}),
        ...(presentationPath ? { presentation: presentationPath } : {}),
        ...(presentationMedia
          ? {
              presentationMediaId: presentationMedia.id,
              presentation: presentationMedia.file,
            }
          : {}),
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
        avatar:
          (await this.objectStorage.getSignedUrl(
            refreshed.avatarBucket,
            refreshed.avatarPath,
          )) || refreshed.avatar,
        presentation:
          (await this.objectStorage.getSignedUrl(
            presentationMedia?.bucket,
            presentationMedia?.originalPath,
          )) || refreshed.presentation,
        avatar_media_id: refreshed.avatarMediaId,
        presentation_media_id: refreshed.presentationMediaId,
        avatar_bucket: refreshed.avatarBucket,
        avatar_path: refreshed.avatarPath,
        bio: refreshed.bio,
        contact: refreshed.contact,
      },
    };
  }

  async sendResetLinkEmail(dto: SendResetLinkDto) {
    assertHoneypotClear(dto.website, 'auth.sendResetEmail');
    const resetMessage =
      'Si cet email existe, un lien de reinitialisation a ete envoye.';

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      this.logger.warn(
        `Password reset requested for unknown email ${dto.email}`,
      );
      return {
        message: resetMessage,
        verification_code: undefined,
      };
    }

    const code = this.verificationCodes.generate(
      this.verificationCodeKey(user.id),
    );
    const frontendUrl =
      process.env.FRONTEND_URL || process.env.APP_URL || 'https://domilix.com';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(code)}`;
    await this.mail.sendPasswordResetLink(user.email, resetUrl);

    return {
      message: resetMessage,
      verification_code:
        process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException(
        'The password confirmation does not match.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      this.logger.warn(
        `Password reset completion attempted for unknown email ${dto.email}`,
      );
      throw new BadRequestException('Lien de reinitialisation invalide.');
    }

    const code = this.verificationCodes.get(this.verificationCodeKey(user.id));
    if (code !== String(dto.token || dto.code || '')) {
      throw new BadRequestException('Lien de reinitialisation invalide.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(dto.password, 10) },
    });
    this.verificationCodes.forget(this.verificationCodeKey(user.id));
    return { message: 'Mot de passe reinitialise avec succes.' };
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const currentPassword = dto.current_password || dto.old_password;
    if (!currentPassword) {
      throw new BadRequestException('Mot de passe actuel requis.');
    }
    if (dto.new_password !== dto.new_password_confirmation) {
      throw new BadRequestException(
        'The new password confirmation does not match.',
      );
    }
    const currentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
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

  async deleteAccount(user: User, dto: DeleteAccountDto) {
    const currentUser = await this.prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
    });
    if (!currentUser) {
      throw new UnauthorizedException('Non authentifie.');
    }

    const matches = await bcrypt.compare(dto.password, currentUser.password);
    if (!matches) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Compte supprime avec succes.' };
  }
}
