import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';

@Injectable()
export class NewslettersService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(newsletter: any) {
    return {
      id: Number(newsletter.id),
      client_id: newsletter.clientId,
      email: newsletter.email,
      verification_token: newsletter.verificationToken,
      verified: newsletter.verified,
      created_at: newsletter.createdAt,
      updated_at: newsletter.updatedAt,
    };
  }

  async index() {
    const subscribers = await this.prisma.newsletter.findMany({
      where: { verified: true },
      orderBy: { createdAt: 'desc' },
    });
    return subscribers.map((item) => this.serialize(item));
  }

  async store(dto: CreateNewsletterDto) {
    const existing = await this.prisma.newsletter.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException({ email: ['The email has already been taken.'] });
    }

    await this.prisma.newsletter.create({
      data: {
        clientId: crypto.randomUUID(),
        email: dto.email,
        verificationToken: crypto.randomUUID(),
        verified: false,
      },
    });

    return {
      message:
        'Subscription successful! Please check your email for a verification link.',
    };
  }

  async show(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({
      where: { id: BigInt(id) },
    });
    if (!newsletter) throw new NotFoundException('Newsletter not found');
    return this.serialize(newsletter);
  }

  async update(id: string, dto: UpdateNewsletterDto) {
    const newsletter = await this.prisma.newsletter.findUnique({
      where: { id: BigInt(id) },
    });
    if (!newsletter) throw new NotFoundException('Newsletter not found');

    const updated = await this.prisma.newsletter.update({
      where: { id: newsletter.id },
      data: {
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
        ...(dto.verification_token !== undefined
          ? { verificationToken: dto.verification_token }
          : {}),
      },
    });

    return this.serialize(updated);
  }

  async destroy(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({
      where: { id: BigInt(id) },
    });
    if (!newsletter) throw new NotFoundException('Newsletter not found');
    await this.prisma.newsletter.delete({ where: { id: newsletter.id } });
    return null;
  }

  async verify(token: string) {
    const newsletter = await this.prisma.newsletter.findFirst({
      where: { verificationToken: token },
    });
    if (!newsletter) {
      throw new BadRequestException({ message: 'Invalid verification token' });
    }

    await this.prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { verified: true, verificationToken: null },
    });

    return { message: 'Email successfully verified!' };
  }
}
