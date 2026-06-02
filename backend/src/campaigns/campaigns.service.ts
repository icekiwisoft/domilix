import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { buildLaravelPagination } from '../common/http/pagination';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private serialize(campaign: any) {
    return {
      id: Number(campaign.id),
      subject: campaign.subject,
      content: campaign.content,
      status: campaign.status,
      sent_at: campaign.sentAt,
      recipients_count:
        campaign._count?.recipients ?? campaign.recipients?.length ?? 0,
      created_at: campaign.createdAt,
      updated_at: campaign.updatedAt,
    };
  }

  async index(query: QueryCampaignsDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(query.per_page || '20', 10) || 20),
    );
    const search = query.search?.trim();

    const where: any = {};
    if (search) {
      where.subject = { contains: search };
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { recipients: true } } },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return buildLaravelPagination(
      campaigns.map((c) => this.serialize(c)),
      {
        total,
        page,
        perPage,
        path: '/admin/campaigns',
      },
    );
  }

  async show(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: BigInt(id) },
      include: {
        recipients: {
          include: { newsletter: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campagne introuvable');
    return {
      ...this.serialize(campaign),
      recipients: campaign.recipients.map((r) => ({
        id: Number(r.id),
        email: r.email,
        sent_at: r.sentAt,
      })),
    };
  }

  async store(dto: CreateCampaignDto) {
    if (!dto.subject?.trim())
      throw new BadRequestException('Le sujet est requis');
    if (!dto.content?.trim())
      throw new BadRequestException('Le contenu est requis');

    const campaign = await this.prisma.campaign.create({
      data: {
        subject: dto.subject.trim(),
        content: dto.content,
        status: 'draft',
      },
    });

    return this.serialize(campaign);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: BigInt(id) },
    });
    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.status === 'sent')
      throw new BadRequestException(
        'Impossible de modifier une campagne déjà envoyée',
      );

    const data: any = {};
    if (dto.subject !== undefined) data.subject = dto.subject.trim();
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.campaign.update({
      where: { id: BigInt(id) },
      data,
    });

    return this.serialize(updated);
  }

  async destroy(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: BigInt(id) },
    });
    if (!campaign) throw new NotFoundException('Campagne introuvable');

    await this.prisma.campaignRecipient.deleteMany({
      where: { campaignId: BigInt(id) },
    });
    await this.prisma.campaign.delete({
      where: { id: BigInt(id) },
    });
  }

  async send(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: BigInt(id) },
    });
    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.status === 'sent')
      throw new BadRequestException('Campagne déjà envoyée');

    this.mailService.ensureConfigured();

    const subscribers = await this.prisma.newsletter.findMany({
      where: { verified: true },
    });

    if (subscribers.length === 0) {
      throw new BadRequestException('Aucun abonné vérifié à qui envoyer');
    }

    const sent: string[] = [];
    const errors: { email: string; error: string }[] = [];

    for (const subscriber of subscribers) {
      try {
        await this.mailService.send({
          to: subscriber.email,
          subject: campaign.subject,
          text: campaign.content.replace(/<[^>]*>/g, ''),
          html: this.mailService.buildNewsletterHtml(campaign.content),
        });

        await this.prisma.campaignRecipient.create({
          data: {
            campaignId: campaign.id,
            newsletterId: subscriber.id,
            email: subscriber.email,
            sentAt: new Date(),
          },
        });

        sent.push(subscriber.email);
      } catch (error: any) {
        errors.push({ email: subscriber.email, error: error.message });
      }
    }

    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return {
      status: 'sent',
      total: subscribers.length,
      sent: sent.length,
      errors: errors.length,
      error_details: errors.length > 0 ? errors : undefined,
    };
  }
}
