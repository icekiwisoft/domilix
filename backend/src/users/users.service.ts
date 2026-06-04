import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Unauthorized');
    }
  }

  private async serializeUser(user: any, includeAnnounces = false) {
    const [liked, announcer, unlocked] = await Promise.all([
      this.prisma.favorite.count({ where: { userId: user.id } }),
      this.prisma.announcer.findFirst({ where: { userId: user.id } }),
      this.prisma.unlocking.count({
        where: { userId: user.id, expiresAt: { gt: new Date() } },
      }),
    ]);
    const announces =
      includeAnnounces && announcer
        ? await this.prisma.ad.findMany({
            where: { announcerId: announcer.id, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              description: true,
              price: true,
              adType: true,
              city: true,
              country: true,
              createdAt: true,
            },
          })
        : undefined;
    const role = user.isAdmin ? 'admin' : announcer ? 'announcer' : 'client';

    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      sex: user.sex,
      devise: user.devise,
      birthday: user.birthday,
      phone: user.phoneNumber,
      phone_number: user.phoneNumber,
      phone_verified: user.phoneVerified,
      email_verified: user.emailVerified,
      email_verified_at: user.emailVerifiedAt,
      is_admin: user.isAdmin,
      role,
      status: user.deletedAt ? 'deleted' : 'active',
      address: null,
      liked,
      unlocked,
      announcer: announcer ? announcer.id : null,
      announcer_profile: announcer
        ? {
            id: announcer.id,
            name: announcer.name,
            contact: announcer.contact,
            verified: Boolean(announcer.verified),
            banned: announcer.banned,
            created_at: announcer.createdAt,
            updated_at: announcer.updatedAt,
          }
        : null,
      announces_count: announcer
        ? await this.prisma.ad.count({
            where: { announcerId: announcer.id, deletedAt: null },
          })
        : 0,
      ...(announces
        ? {
            announces: announces.map((ad) => ({
              id: Number(ad.id),
              description: ad.description,
              price: Number(ad.price),
              ad_type: ad.adType,
              city: ad.city,
              country: ad.country,
              created_at: ad.createdAt,
            })),
          }
        : {}),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async create(currentUser: any, dto: CreateUserDto) {
    this.ensureAdmin(currentUser);

    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException({
        errors: { password_confirmation: ['Les mots de passe ne correspondent pas.'] },
      });
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException({
        errors: { email: ['Cet email est déjà utilisé.'] },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return this.serializeUser(user);
  }

  async index(currentUser: any, page = 1) {
    this.ensureAdmin(currentUser);
    const perPage = 15;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    const data = await Promise.all(
      users.map((user) => this.serializeUser(user)),
    );
    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/users',
      query: { page },
    });
  }

  async show(currentUser: any, id: string) {
    this.ensureAdmin(currentUser);
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return this.serializeUser(user, true);
  }

  async update(currentUser: any, id: string, dto: UpdateUserDto) {
    this.ensureAdmin(currentUser);
    const userId = BigInt(id);
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing || existing.deletedAt)
      throw new NotFoundException('User not found');

    if (dto.email !== undefined) {
      const emailOwner = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (emailOwner) {
        throw new BadRequestException({
          errors: { email: ['The email has already been taken.'] },
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        ...(dto.phone_number !== undefined
          ? { phoneNumber: dto.phone_number }
          : {}),
        ...(dto.phone_verified !== undefined
          ? { phoneVerified: dto.phone_verified }
          : {}),
        ...(dto.is_admin !== undefined ? { isAdmin: dto.is_admin } : {}),
      },
    });

    return this.serializeUser(updated);
  }

  async destroy(currentUser: any, id: string) {
    this.ensureAdmin(currentUser);
    const userId = BigInt(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return null;
  }

  async becomeAnnouncer(currentUser: any, id: string) {
    this.ensureAdmin(currentUser);
    const userId = BigInt(id);
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser || existingUser.deletedAt)
      throw new NotFoundException('User not found');

    const existingRequest = await this.prisma.announcerRequest.findFirst({
      where: { userId },
    });
    if (existingRequest) {
      throw new BadRequestException({
        status: 400,
        message: 'A request to become an announcer already exists',
      });
    }

    await this.prisma.announcerRequest.create({
      data: {
        clientId: crypto.randomUUID(),
        userId,
        status: 'pending',
      },
    });

    return { message: 'Request to become an announcer has been submitted' };
  }
}
