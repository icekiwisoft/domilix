import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMapsListingsDto, QueryMapsNearbyDto } from './dto/query-maps.dto';

@Injectable()
export class MapsService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeListing(
    ad: any,
    announcerName?: string,
    announcerVerified?: boolean,
  ) {
    const re = ad.realEstate as { lat?: number | null; lng?: number | null; bedroom?: number; toilet?: number } | null;
    return {
      id: Number(ad.id),
      title: ad.description?.substring(0, 80) || 'Annonce' as string,
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
      thumbnail: null,
      is_verified: announcerVerified ?? false,
      advertiser_name: announcerName ?? '',
    };
  }

  async listings(query: QueryMapsListingsDto) {
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

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { createdAt: 'desc' } }),
      this.prisma.ad.count({ where }),
    ]);

    const adIds = ads.map((a) => a.adId);
    const announcerIds = [...new Set(ads.map((a) => a.announcerId))];

    const [realEstates, announcers] = await Promise.all([
      adIds.length > 0
        ? this.prisma.realEstate.findMany({ where: { id: { in: adIds } }, select: { id: true, lat: true, lng: true, bedroom: true, toilet: true } })
        : ([] as Array<{ id: bigint; lat: number | null; lng: number | null; bedroom: number; toilet: number }>),
      announcerIds.length > 0
        ? this.prisma.announcer.findMany({ where: { id: { in: announcerIds } }, select: { id: true, name: true, verified: true } })
        : ([] as Array<{ id: string; name: string; verified: boolean }>),
    ]);

    const reMap = new Map<string, { lat: number | null; lng: number | null; bedroom: number; toilet: number }>();
    for (const re of realEstates) {
      reMap.set(re.id.toString(), re);
    }

    const announcerMap = new Map<string, { name: string; verified: boolean }>();
    for (const a of announcers) {
      announcerMap.set(a.id, a);
    }

    const data = ads
      .map((ad) => {
        const re = reMap.get(ad.adId.toString()) ?? null;
        const announcer = announcerMap.get(ad.announcerId);
        return this.serializeListing(
          { ...ad, realEstate: re },
          announcer?.name,
          announcer?.verified,
        );
      })
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

  async nearby(query: QueryMapsNearbyDto) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    const radiusKm = parseFloat(query.radius || '5');

    if (isNaN(lat) || isNaN(lng)) {
      return { data: [], total: 0 };
    }

    const realEstates = await this.prisma.realEstate.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      select: { id: true, lat: true, lng: true, bedroom: true, toilet: true },
    });

    const nearbyReIds: bigint[] = [];
    for (const re of realEstates) {
      if (re.lat === null || re.lng === null) continue;
      const distance = this.haversineDistance(lat, lng, re.lat, re.lng);
      if (distance <= radiusKm) {
        nearbyReIds.push(re.id);
      }
    }

    if (nearbyReIds.length === 0) {
      return { data: [], total: 0 };
    }

    const ads = await this.prisma.ad.findMany({
      where: { deletedAt: null, hidden: false, adId: { in: nearbyReIds } },
      take: 50,
    });

    const announcerIds = [...new Set(ads.map((a) => a.announcerId))];
    const announcers = announcerIds.length > 0
      ? await this.prisma.announcer.findMany({ where: { id: { in: announcerIds } }, select: { id: true, name: true, verified: true } })
      : ([] as Array<{ id: string; name: string; verified: boolean }>);

    const reMap = new Map<string, { lat: number | null; lng: number | null; bedroom: number; toilet: number }>();
    for (const re of realEstates) {
      if (nearbyReIds.includes(re.id)) {
        reMap.set(re.id.toString(), re);
      }
    }

    const announcerMap = new Map<string, { name: string; verified: boolean }>();
    for (const a of announcers) {
      announcerMap.set(a.id, a);
    }

    const data = ads.map((ad) => {
      const re = reMap.get(ad.adId.toString()) ?? null;
      const announcer = announcerMap.get(ad.announcerId);
      return this.serializeListing(
        { ...ad, realEstate: re },
        announcer?.name,
        announcer?.verified,
      );
    });

    return { data, total: data.length };
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
