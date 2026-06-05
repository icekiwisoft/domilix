import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAnnouncerRequestDto } from './dto/update-announcer-request.dto';

@Injectable()
export class AnnouncerRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(request: any) {
    return {
      id: Number(request.id),
      client_id: request.clientId,
      user_id: Number(request.userId),
      status: request.status,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
      user: request.user
        ? {
            id: Number(request.user.id),
            name: request.user.name,
            email: request.user.email,
            phone_number: request.user.phoneNumber,
            created_at: request.user.createdAt,
          }
        : undefined,
    };
  }

  async index() {
    const requests = await this.prisma.announcerRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return requests.map((request) => this.serialize(request));
  }

  async store(userId: bigint) {
    const existing = await this.prisma.announcerRequest.findFirst({
      where: { userId, status: { in: ['pending', 'approved'] } },
    });
    if (existing) {
      throw new BadRequestException({
        message:
          'You already have a pending request or are already an advertiser.',
      });
    }

    await this.prisma.announcerRequest.create({
      data: {
        clientId: crypto.randomUUID(),
        userId,
        status: 'pending',
      },
    });

    return {
      message:
        'Your request to become an announcer has been successfully submitted.',
    };
  }

  async show(id: string) {
    const request = await this.prisma.announcerRequest.findUnique({
      where: { id: BigInt(id) },
      include: { user: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    return this.serialize(request);
  }

  async update(id: string, dto: UpdateAnnouncerRequestDto) {
    const announcerRequest = await this.prisma.announcerRequest.findUnique({
      where: { id: BigInt(id) },
      include: { user: true },
    });
    if (!announcerRequest) throw new NotFoundException('Request not found');
    if (announcerRequest.status !== 'pending') {
      throw new BadRequestException({
        message: 'The request has already been processed.',
      });
    }

    await this.prisma.announcerRequest.update({
      where: { id: announcerRequest.id },
      data: { status: dto.status },
    });

    if (dto.status === 'approved') {
      const existingAnnouncer = await this.prisma.announcer.findFirst({
        where: { userId: announcerRequest.userId },
      });

      if (!existingAnnouncer) {
        await this.prisma.announcer.create({
          data: {
            id: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            userId: announcerRequest.userId,
            name: announcerRequest.user.name,
          },
        });
      }
    }

    return { message: 'Request status updated successfully.' };
  }

  async destroy(id: string) {
    const request = await this.prisma.announcerRequest.findUnique({
      where: { id: BigInt(id) },
    });
    if (!request) throw new NotFoundException('Request not found');
    await this.prisma.announcerRequest.delete({ where: { id: request.id } });
    return { message: 'Request deleted successfully.' };
  }
}
