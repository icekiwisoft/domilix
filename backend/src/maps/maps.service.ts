import crypto from 'node:crypto';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMapsListingsDto, QueryMapsNearbyDto } from './dto/query-maps.dto';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { itemTypeToApiType, storageUrl } from '../common/http/formatters';

export const MAPS_PLANS = {
  decouverte: { label: 'Découverte', price: 0, durationDays: 0, unlockCount: 0, durationHours: 12 },
  starter: { label: 'Starter', price: 2000, durationDays: 30, unlockCount: 5, durationHours: 0 },
  pro: { label: 'Pro', price: 5000, durationDays: 30, unlockCount: 20, durationHours: 0 },
  business: { label: 'Business', price: 15000, durationDays: 30, unlockCount: 50, durationHours: 0 },
};

export type MapsPlan = keyof typeof MAPS_PLANS;

type MapMedia = {
  id: string;
  file: string | null;
  thumbnail: string | null;
  url: string | null;
  path: string | null;
  type: string | null;
};

@Injectable()
export class MapsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  private async serializeMedia(media: any): Promise<MapMedia> {
    const signedFile = await this.objectStorage.getSignedUrl(
      media.bucket,
      media.originalPath,
    );
    const signedThumbnail =
      media.thumbnailPath && media.thumbnailPath !== media.originalPath
        ? await this.objectStorage.getSignedUrl(media.bucket, media.thumbnailPath)
        : null;

    return {
      id: media.id,
      file: signedFile || storageUrl(media.file),
      thumbnail: signedThumbnail || signedFile || storageUrl(media.thumbnail || media.file),
      url: signedFile || storageUrl(media.file),
      path: storageUrl(media.file),
      type: media.type || null,
    };
  }

  private wantsLikedOnly(value?: string) {
    return ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
  }

  private wantsUnlockedOnly(value?: string) {
    return ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
  }

  private async serializeListing(
    ad: any,
    liked: boolean,
    unlocked: boolean,
    announcerName?: string,
    announcerVerified?: boolean,
  ) {
    const re = ad.realEstate as { lat?: number | null; lng?: number | null; bedroom?: number; toilet?: number } | null;
    const medias = await Promise.all((ad.medias || []).map((media: any) => this.serializeMedia(media)));
    const thumbnail = medias.find((media) => media.thumbnail)?.thumbnail || medias.find((media) => media.file)?.file || null;

    return {
      id: Number(ad.id),
      type: itemTypeToApiType(ad.itemType as string),
      title: ad.description?.substring(0, 80) || 'Annonce',
      description: ad.description as string | undefined,
      price: Number(ad.price),
      devise: (ad.devise as string) || 'XOF',
      period: (ad.period as string) || 'month',
      item_type: (ad.itemType as string) || '',
      ad_type: (ad.adType as string) || 'location',
      city: (ad.city as string) || '',
      neighbourhood: (ad.neighbourhood as string) || '',
      address: (ad.adress as string) || '',
      country: (ad.country as string) || '',
      latitude: re?.lat ?? null,
      longitude: re?.lng ?? null,
      bedrooms: re?.bedroom ?? 0,
      bathrooms: re?.toilet ?? 0,
      thumbnail,
      medias,
      is_verified: announcerVerified ?? false,
      is_liked: liked,
      is_unlocked: unlocked,
      advertiser_name: announcerName ?? '',
    };
  }

  async listings(query: QueryMapsListingsDto, currentUserId?: bigint) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(query.per_page || '50', 10) || 50));

    const where: any = { deletedAt: null, hidden: false };

    const bboxWest = query.bbox_west ? parseFloat(query.bbox_west) : undefined;
    const bboxSouth = query.bbox_south ? parseFloat(query.bbox_south) : undefined;
    const bboxEast = query.bbox_east ? parseFloat(query.bbox_east) : undefined;
    const bboxNorth = query.bbox_north ? parseFloat(query.bbox_north) : undefined;

    if (query.city) where.city = { contains: query.city };
    if (query.item_type) where.itemType = query.item_type;
    if (query.ad_type) where.adType = query.ad_type;
    if (query.price_min || query.price_max) {
      where.price = {};
      if (query.price_min) where.price.gte = parseFloat(query.price_min);
      if (query.price_max) where.price.lte = parseFloat(query.price_max);
    }

    let likedIds = new Set<string>();
    const likedOnly = this.wantsLikedOnly(query.is_liked);
    let unlockedIds = new Set<string>();
    const unlockedOnly = this.wantsUnlockedOnly(query.is_unlocked);

    if ((likedOnly || unlockedOnly) && !currentUserId) {
      return { data: [], total: 0 };
    }

    if (likedOnly && currentUserId) {
      const favorites = await this.prisma.favorite.findMany({
        where: { userId: currentUserId },
        select: { adId: true },
      });
      likedIds = new Set(favorites.map((f) => f.adId));
      Object.assign(where, { id: { in: [...likedIds].map((id) => BigInt(id)) } });
    }

    if (unlockedOnly && currentUserId) {
      const unlockings = await this.prisma.unlocking.findMany({
        where: { userId: currentUserId, expiresAt: { gt: new Date() } },
        select: { adId: true },
      });
      unlockedIds = new Set(unlockings.map((item) => item.adId));
      Object.assign(where, { id: { in: [...unlockedIds].map((id) => BigInt(id)) } });
    }

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { createdAt: 'desc' } }),
      this.prisma.ad.count({ where }),
    ]);

    const adIds = ads.map((a) => a.adId);
    const announcerIds = [...new Set(ads.map((a) => a.announcerId))];

    if (currentUserId && likedIds.size === 0) {
      const favorites = await this.prisma.favorite.findMany({
        where: { userId: currentUserId, adId: { in: ads.map((a) => a.id.toString()) } },
        select: { adId: true },
      });
      likedIds = new Set(favorites.map((f) => f.adId));
    }

    if (currentUserId && unlockedIds.size === 0) {
      const unlockings = await this.prisma.unlocking.findMany({
        where: { userId: currentUserId, adId: { in: ads.map((a) => a.id.toString()) }, expiresAt: { gt: new Date() } },
        select: { adId: true },
      });
      unlockedIds = new Set(unlockings.map((item) => item.adId));
    }

    const [realEstates, announcers, adMedias] = await Promise.all([
      adIds.length > 0
        ? this.prisma.realEstate.findMany({ where: { id: { in: adIds } }, select: { id: true, lat: true, lng: true, bedroom: true, toilet: true } })
        : ([] as Array<{ id: bigint; lat: number | null; lng: number | null; bedroom: number; toilet: number }>),
      announcerIds.length > 0
        ? this.prisma.announcer.findMany({ where: { id: { in: announcerIds } }, select: { id: true, name: true, verified: true } })
        : ([] as Array<{ id: string; name: string; verified: boolean }>),
      ads.length > 0
        ? this.prisma.adMedia.findMany({ where: { adId: { in: ads.map((ad) => ad.id.toString()) } }, orderBy: [{ isPresentation: 'desc' }, { id: 'asc' }] })
        : ([] as Array<{ adId: string; mediaId: string }>),
    ]);

    const mediaIds = [...new Set(adMedias.map((entry) => entry.mediaId))];
    const medias = mediaIds.length
      ? await this.prisma.media.findMany({ where: { id: { in: mediaIds } } })
      : [];

    const reMap = new Map<string, { lat: number | null; lng: number | null; bedroom: number; toilet: number }>();
    for (const re of realEstates) reMap.set(re.id.toString(), re);

    const announcerMap = new Map<string, { name: string; verified: boolean }>();
    for (const a of announcers) announcerMap.set(a.id, a);

    const mediaMap = new Map<string, any>();
    for (const media of medias) mediaMap.set(media.id, media);

    const adMediasMap = new Map<string, any[]>();
    for (const ad of ads) {
      const entries = adMedias.filter((entry) => entry.adId === ad.id.toString());
      adMediasMap.set(ad.id.toString(), entries.map((entry) => mediaMap.get(entry.mediaId)).filter(Boolean));
    }

    const data = (await Promise.all(ads
      .map((ad) => {
        const re = reMap.get(ad.adId.toString()) ?? null;
        const announcer = announcerMap.get(ad.announcerId);
        const liked = likedIds.has(ad.id.toString());
        const unlocked = unlockedIds.has(ad.id.toString());
        const medias = adMediasMap.get(ad.id.toString()) || [];
        return this.serializeListing({ ...ad, realEstate: re, medias }, liked, unlocked, announcer?.name, announcer?.verified);
      })))
      .filter((item) => {
        if (bboxWest !== undefined && bboxSouth !== undefined && bboxEast !== undefined && bboxNorth !== undefined) {
          if (item.latitude === null || item.longitude === null) return false;
          if (item.longitude < bboxWest || item.longitude > bboxEast) return false;
          if (item.latitude < bboxSouth || item.latitude > bboxNorth) return false;
        }
        return true;
      });

    return { data, total };
  }

  async nearby(query: QueryMapsNearbyDto, currentUserId?: bigint) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    const radiusKm = parseFloat(query.radius || '5');

    if (isNaN(lat) || isNaN(lng)) return { data: [], total: 0 };

    const realEstates = await this.prisma.realEstate.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { id: true, lat: true, lng: true, bedroom: true, toilet: true },
    });

    const nearbyReIds: bigint[] = [];
    for (const re of realEstates) {
      if (re.lat === null || re.lng === null) continue;
      if (this.haversineDistance(lat, lng, re.lat, re.lng) <= radiusKm) nearbyReIds.push(re.id);
    }

    if (nearbyReIds.length === 0) return { data: [], total: 0 };

    const ads = await this.prisma.ad.findMany({
      where: { deletedAt: null, hidden: false, adId: { in: nearbyReIds } },
      take: 50,
    });

    const announcerIds = [...new Set(ads.map((a) => a.announcerId))];

    const [announcers, favorites, adMedias] = await Promise.all([
      announcerIds.length > 0
        ? this.prisma.announcer.findMany({ where: { id: { in: announcerIds } }, select: { id: true, name: true, verified: true } })
        : ([] as Array<{ id: string; name: string; verified: boolean }>),
      currentUserId
        ? this.prisma.favorite.findMany({ where: { userId: currentUserId, adId: { in: ads.map((a) => a.id.toString()) } }, select: { adId: true } })
        : ([] as Array<{ adId: string }>),
      ads.length > 0
        ? this.prisma.adMedia.findMany({ where: { adId: { in: ads.map((ad) => ad.id.toString()) } }, orderBy: [{ isPresentation: 'desc' }, { id: 'asc' }] })
        : ([] as Array<{ adId: string; mediaId: string }>),
    ]);

    const mediaIds = [...new Set(adMedias.map((entry) => entry.mediaId))];
    const medias = mediaIds.length
      ? await this.prisma.media.findMany({ where: { id: { in: mediaIds } } })
      : [];

    const likedIds = new Set(favorites.map((f) => f.adId));
    const unlockedIds = currentUserId
      ? new Set((await this.prisma.unlocking.findMany({
        where: { userId: currentUserId, adId: { in: ads.map((a) => a.id.toString()) }, expiresAt: { gt: new Date() } },
        select: { adId: true },
      })).map((item) => item.adId))
      : new Set<string>();

    const reMap = new Map<string, { lat: number | null; lng: number | null; bedroom: number; toilet: number }>();
    for (const re of realEstates) { if (nearbyReIds.includes(re.id)) reMap.set(re.id.toString(), re); }

    const announcerMap = new Map<string, { name: string; verified: boolean }>();
    for (const a of announcers) announcerMap.set(a.id, a);

    const mediaMap = new Map<string, any>();
    for (const media of medias) mediaMap.set(media.id, media);

    const adMediasMap = new Map<string, any[]>();
    for (const ad of ads) {
      const entries = adMedias.filter((entry) => entry.adId === ad.id.toString());
      adMediasMap.set(ad.id.toString(), entries.map((entry) => mediaMap.get(entry.mediaId)).filter(Boolean));
    }

    const data = await Promise.all(ads.map((ad) => {
      const re = reMap.get(ad.adId.toString()) ?? null;
      const announcer = announcerMap.get(ad.announcerId);
      const liked = likedIds.has(ad.id.toString());
      const unlocked = unlockedIds.has(ad.id.toString());
      const medias = adMediasMap.get(ad.id.toString()) || [];
      return this.serializeListing({ ...ad, realEstate: re, medias }, liked, unlocked, announcer?.name, announcer?.verified);
    }));

    return { data, total: data.length };
  }

  getPlans() {
    return Object.entries(MAPS_PLANS).map(([key, plan]) => ({
      id: key,
      label: plan.label,
      price: plan.price,
      duration_days: plan.durationDays,
      duration_hours: plan.durationHours,
      unlock_count: plan.unlockCount,
    }));
  }

  private computeEndDate(plan: keyof typeof MAPS_PLANS): Date {
    const cfg = MAPS_PLANS[plan];
    const now = new Date();
    if (cfg.durationHours > 0) {
      return new Date(now.getTime() + cfg.durationHours * 60 * 60 * 1000);
    }
    const end = new Date(now);
    end.setDate(end.getDate() + cfg.durationDays);
    return end;
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getCampayConfig() {
    const token = process.env.CAMPAY_TOKEN;
    const endpoint = process.env.CAMPAY_ENDPOINT || 'https://demo.campay.net/api/collect/';
    if (!token) {
      throw new InternalServerErrorException('CAMPAY_TOKEN is not configured.');
    }
    return { token, endpoint };
  }

  private async collectCampayPayment(data: { amount: number; from: string; externalReference: string; description: string }) {
    const { token, endpoint } = this.getCampayConfig();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.amount,
        from: data.from,
        description: data.description,
        external_reference: data.externalReference,
      }),
    });
    const text = await response.text();
    let payload: unknown = text;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (!response.ok) {
      throw new BadRequestException({
        message: 'Campay payment request failed.',
        status: response.status,
        response: payload,
      });
    }
    return payload;
  }

  /** Activate a Maps subscription without payment (for free plans or after webhook confirmation). */
  async activateSubscription(userId: bigint, plan: string) {
    const cfg = MAPS_PLANS[plan as MapsPlan];
    const now = new Date();
    const endDate = this.computeEndDate(plan as MapsPlan);
    const subscription = await this.prisma.mapsSubscription.create({
      data: {
        userId,
        plan,
        active: true,
        price: cfg.price,
        unlockCount: cfg.unlockCount,
        startDate: now,
        endDate,
      },
    });
    return {
      id: Number(subscription.id),
      plan: subscription.plan,
      active: subscription.active,
      price: Number(subscription.price),
      unlock_count: subscription.unlockCount,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      created_at: subscription.createdAt,
    };
  }

  async subscribe(userId: bigint, plan: string, payment?: { paymentMethod?: string; phoneNumber?: string }) {
    if (!MAPS_PLANS[plan as MapsPlan]) {
      throw new BadRequestException(`Plan "${plan}" invalide. Plans disponibles : ${Object.keys(MAPS_PLANS).join(', ')}`);
    }

    const cfg = MAPS_PLANS[plan as MapsPlan];

    const existing = await this.prisma.mapsSubscription.findFirst({
      where: { userId, active: true },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà un abonnement Maps actif. Résiliez-le d\'abord ou attendez son expiration.');
    }

    /* Free plan – activate directly */
    if (cfg.price <= 0) {
      const subscription = await this.activateSubscription(userId, plan);
      return { subscription, free: true };
    }

    /* Paid plan – require payment info */
    if (!payment?.paymentMethod || !payment?.phoneNumber) {
      return {
        requires_payment: true,
        plan,
        price: cfg.price,
        message: 'Ce plan nécessite un paiement. Fournissez payment_method et phone_number.',
      };
    }

    const methodMap: Record<string, string> = { orange_money: 'orange', mtn_money: 'mtn', orange: 'orange', mtn: 'mtn' };
    const paymentMethod = methodMap[payment.paymentMethod.toLowerCase()];
    if (!paymentMethod) {
      throw new BadRequestException('Méthode de paiement non supportée. Utilisez "mtn" ou "orange".');
    }

    const paymentRecord = await this.prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        userId,
        paymentType: 'subscription',
        paymentMethod,
        paymentInfo: payment.phoneNumber,
        paymentTypeInfo: `maps_${plan}`,
        amount: cfg.price,
        status: 'pending',
      },
    });

    const campayResponse = await this.collectCampayPayment({
      amount: cfg.price,
      from: payment.phoneNumber,
      description: `Domilix Maps ${cfg.label}`,
      externalReference: paymentRecord.id,
    });

    return {
      message: 'Demande de paiement envoyée. Validez la transaction sur votre téléphone.',
      payment_id: paymentRecord.id,
      provider: 'campay',
      campay: campayResponse,
      requires_payment: true,
    };
  }

  async status(userId: bigint) {
    const sub = await this.prisma.mapsSubscription.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return { active: false, subscription: null };

    const now = new Date();
    const expired = sub.endDate && sub.endDate < now;

    if (expired) {
      await this.prisma.mapsSubscription.update({
        where: { id: sub.id },
        data: { active: false },
      });
      return { active: false, subscription: null };
    }

    return {
      active: true,
      subscription: {
        id: Number(sub.id),
        plan: sub.plan,
        active: true,
        price: Number(sub.price),
        unlock_count: sub.unlockCount,
        start_date: sub.startDate,
        end_date: sub.endDate,
        created_at: sub.createdAt,
      },
    };
  }

  async cancel(userId: bigint) {
    const sub = await this.prisma.mapsSubscription.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) throw new NotFoundException('Aucun abonnement Maps actif trouvé.');

    await this.prisma.mapsSubscription.update({
      where: { id: sub.id },
      data: { active: false, endDate: new Date() },
    });

    return { message: 'Abonnement Maps annulé.' };
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number { return deg * (Math.PI / 180); }
}
