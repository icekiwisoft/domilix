import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async serializeUser(user: any) {
    const [liked, announcer] = await Promise.all([
      this.prisma.favorite.count({ where: { userId: user.id } }),
      this.prisma.announcer.findFirst({ where: { userId: user.id } }),
    ]);

    return {
      name: user.name,
      sex: user.sex,
      devise: user.devise,
      phone_number: user.phoneNumber,
      liked,
      announcer: announcer ? announcer.id : null,
    };
  }

  async index(page = 1) {
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

    const data = await Promise.all(users.map((user) => this.serializeUser(user)));
    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/users',
      query: { page },
    });
  }

  async show(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return this.serializeUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const userId = BigInt(id);
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing || existing.deletedAt) throw new NotFoundException('User not found');

    const emailOwner = await this.prisma.user.findFirst({
      where: { email: dto.email, NOT: { id: userId } },
    });
    if (emailOwner) {
      throw new BadRequestException({ errors: { email: ['The email has already been taken.'] } });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        ...(dto.phone_number !== undefined ? { phoneNumber: dto.phone_number } : {}),
        ...(dto.phone_verified !== undefined ? { phoneVerified: dto.phone_verified } : {}),
        ...(dto.is_admin !== undefined ? { isAdmin: dto.is_admin } : {}),
      },
    });

    return this.serializeUser(updated);
  }

  async destroy(id: string) {
    const userId = BigInt(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return null;
  }

  async becomeAnnouncer(id: string) {
    const userId = BigInt(id);
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser || existingUser.deletedAt) throw new NotFoundException('User not found');

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
