import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import {
  boolFromUnknown,
  itemTypeToApiType,
  storageUrl,
  toNumber,
} from '../common/http/formatters';
import { generateMediaThumbnailBuffer, MAX_AD_MEDIAS } from '../common/media/thumbnails';
import { validateUploadedFile } from '../common/media/validate-upload';
import { ObjectStorageService } from '../common/object-storage/object-storage.service';
import { buildLaravelPagination } from '../common/http/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { AddressesService } from '../addresses/addresses.service';
import { QueryAdsDto } from './dto/query-ads.dto';
import { QueryCitiesDto } from './dto/query-cities.dto';

const REAL_ESTATE_CLASS = 'App\\Models\\RealEstate';
const FURNITURE_CLASS = 'App\\Models\\Furniture';
type MapPair<K, V> = [K, V];
const AD_PERIODS = ['hour', 'day', 'night', 'month', 'year'] as const;
const AD_DEVISES = [
  'USD','EUR','GBP','XOF','XAF','NGN','KES','GHS','ZAR','JPY','CNY','INR','BRL','RUB','CAD','AUD','CHF','SGD','NZD','MXN','TRY','AED','SAR',
] as const;

@Injectable()
export class AdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorage: ObjectStorageService,
    private readonly addressesService: AddressesService,
  ) {}

  private async resolveAddressFromCoordinates(longitude: number | null, latitude: number | null) {
    if (longitude === null || latitude === null) return null;

    const result = await this.addressesService.reverseGeocode({ longitude, latitude }).catch(() => null);
    return result?.success ? result.data : null;
  }

  private async ensureAnnouncerUser(userId: bigint) {
    const announcer = await this.prisma.announcer.findFirst({ where: { userId } });
    if (!announcer) {
      throw new ForbiddenException("Vous n'etes pas un annonceur");
    }
    return announcer;
  }

  private normalizePeriod(period?: unknown) {
    if (typeof period !== 'string') return undefined;
    return AD_PERIODS.includes(period as (typeof AD_PERIODS)[number])
      ? (period as (typeof AD_PERIODS)[number])
      : undefined;
  }

  private normalizeDevise(devise?: unknown) {
    if (typeof devise !== 'string') return undefined;
    return AD_DEVISES.includes(devise as (typeof AD_DEVISES)[number])
      ? (devise as (typeof AD_DEVISES)[number])
      : undefined;
  }

  private optionalString(value: unknown) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed || null;
  }

  private buildAdWhere(
    query: QueryAdsDto,
    realEstateIds?: bigint[],
  ): Prisma.AdWhereInput {
    const and: Prisma.AdWhereInput[] = [];

    if (query.search) {
      const or: Prisma.AdWhereInput[] = [
        { description: { contains: query.search } },
        { adress: { contains: query.search } },
        { city: { contains: query.search } },
        { neighbourhood: { contains: query.search } },
      ];

      const numericSearch = Number(query.search);
      if (!Number.isNaN(numericSearch)) {
        or.push({ price: { equals: numericSearch } });
      }

      and.push({ OR: or });
    }

    if (query.type) {
      and.push({
        itemType: query.type === 'furniture' ? FURNITURE_CLASS : REAL_ESTATE_CLASS,
      });
    }

    if (query.budget_min || query.budget_max) {
      and.push({
        price: {
          ...(query.budget_min ? { gte: Number(query.budget_min) } : {}),
          ...(query.budget_max ? { lte: Number(query.budget_max) } : {}),
        },
      });
    }

    if (query.category_id?.length) {
      and.push({ categoryId: { in: query.category_id } });
    }

    if (query.ad_type) and.push({ adType: query.ad_type });
    if (query.city) and.push({ city: { contains: query.city } });

    const addressFilter = query.address || query.adress;
    if (addressFilter) and.push({ adress: { contains: addressFilter } });

    if (query.devise) {
      const devise = this.normalizeDevise(query.devise);
      if (devise) and.push({ devise });
    }
    if (query.period) {
      const period = this.normalizePeriod(query.period);
      if (period) and.push({ period });
    }

    if (realEstateIds) {
      and.push({ itemType: REAL_ESTATE_CLASS, adId: { in: realEstateIds } });
    }

    return and.length ? { AND: and } : {};
  }

  private async findMatchingRealEstateIds(query: QueryAdsDto): Promise<bigint[] | undefined> {
    const needRealEstateFilter =
      query.bedroom_min || query.bedroom_max || query.amenities?.length || query.standing;

    if (!needRealEstateFilter) return undefined;

    const where: Prisma.RealEstateWhereInput = {};

    if (query.bedroom_min || query.bedroom_max) {
      where.bedroom = {
        ...(query.bedroom_min ? { gte: Number(query.bedroom_min) } : {}),
        ...(query.bedroom_max ? { lte: Number(query.bedroom_max) } : {}),
      };
    }

    if (query.amenities?.length) {
      for (const amenity of query.amenities) {
        if (amenity === 'gate') where.gate = true;
        if (amenity === 'wifi') where.wifi = true;
        if (amenity === 'air_conditioning') where.airConditioning = true;
        if (amenity === 'security_24h') where.security24h = true;
        if (amenity === 'smart_tv') where.smartTv = true;
        if (amenity === 'equipped_kitchen') where.equippedKitchen = true;
        if (amenity === 'pool') where.pool = true;
        if (amenity === 'garage') where.garage = true;
        if (amenity === 'furnitured') where.furnished = true;
      }
    }

    const realEstates = await this.prisma.realEstate.findMany({
      where,
      select: {
        id: true,
        gate: true,
        wifi: true,
        airConditioning: true,
        security24h: true,
        smartTv: true,
        equippedKitchen: true,
        pool: true,
        garage: true,
        furnished: true,
      },
    });

    const filtered = realEstates.filter((entry) => {
      if (!query.standing) return true;
      const count = [
        entry.gate,
        entry.wifi,
        entry.airConditioning,
        entry.security24h,
        entry.smartTv,
        entry.equippedKitchen,
        entry.pool,
        entry.garage,
        entry.furnished,
      ].filter(Boolean).length;
      if (query.standing === 'standard') return count <= 1;
      if (query.standing === 'confort') return count >= 2 && count <= 3;
      if (query.standing === 'haut_standing') return count === 4;
      return true;
    });

    return filtered.map((entry) => entry.id);
  }

  private async loadRelations(ads: Array<{ id: bigint; announcerId: string; categoryId: string | null; adId: bigint; itemType: string }>) {
    const adIds = ads.map((ad) => ad.id.toString());
    const categoryIds = Array.from(new Set(ads.map((ad) => ad.categoryId).filter(Boolean))) as string[];
    const announcerIds = Array.from(new Set(ads.map((ad) => ad.announcerId)));
    const realEstateIds = ads.filter((ad) => ad.itemType === REAL_ESTATE_CLASS).map((ad) => ad.adId);
    const furnitureIds = ads.filter((ad) => ad.itemType === FURNITURE_CLASS).map((ad) => ad.adId);

    const [categories, announcers, adMedias, realEstates, furnitures] = await Promise.all([
      categoryIds.length
        ? this.prisma.category.findMany({
            where: { id: { in: categoryIds.map((id) => BigInt(id)) } },
          })
        : Promise.resolve([]),
      announcerIds.length
        ? this.prisma.announcer.findMany({
            where: { id: { in: announcerIds } },
            include: { user: true },
          })
        : Promise.resolve([]),
      adIds.length
        ? this.prisma.adMedia.findMany({
            where: { adId: { in: adIds } },
            orderBy: [{ isPresentation: 'desc' }, { id: 'asc' }],
          })
        : Promise.resolve([]),
      realEstateIds.length
        ? this.prisma.realEstate.findMany({ where: { id: { in: realEstateIds } } })
        : Promise.resolve([]),
      furnitureIds.length
        ? this.prisma.furniture.findMany({ where: { id: { in: furnitureIds } } })
        : Promise.resolve([]),
    ]);

    const mediaIds = Array.from(new Set(adMedias.map((entry) => entry.mediaId)));
    const medias = mediaIds.length
      ? await this.prisma.media.findMany({
          where: { id: { in: mediaIds } },
          include: { announcer: { include: { user: true } } },
        })
      : [];

    return {
      categories: new Map(
        categories.map(
          (item) => [item.id.toString(), item] as MapPair<string, (typeof categories)[number]>,
        ),
      ),
      announcers: new Map(
        announcers.map((item) => [item.id, item] as MapPair<string, (typeof announcers)[number]>),
      ),
      adMedias: new Map(
        adIds.map(
          (id) => [id, adMedias.filter((item: any) => item.adId === id)] as MapPair<string, typeof adMedias>,
        ),
      ),
      medias: new Map(
        medias.map((item) => [item.id, item] as MapPair<string, (typeof medias)[number]>),
      ),
      realEstates: new Map(
        realEstates.map(
          (item) => [item.id.toString(), item] as MapPair<string, (typeof realEstates)[number]>,
        ),
      ),
      furnitures: new Map(
        furnitures.map(
          (item) => [item.id.toString(), item] as MapPair<string, (typeof furnitures)[number]>,
        ),
      ),
    };
  }

  private serializeUser(user: { name: string; sex: string; devise: string; phoneNumber: string }, announcerId: string) {
    return {
      name: user.name,
      sex: user.sex,
      devise: user.devise,
      phone_number: user.phoneNumber,
      liked: 0,
      announcer: announcerId,
    };
  }

  private async serializeAnnouncer(announcer: any) {
    const avatarMedia = announcer.avatarMediaId
      ? await this.prisma.media.findUnique({ where: { id: announcer.avatarMediaId } })
      : null;

    return {
      id: announcer.id,
      name: announcer.name,
      user: this.serializeUser(announcer.user, announcer.id),
      avatar: await this.objectStorage.getSignedUrl(avatarMedia?.bucket || announcer.avatarBucket, avatarMedia?.originalPath || announcer.avatarPath) || storageUrl(announcer.avatar),
      avatar_media_id: announcer.avatarMediaId,
      contact: announcer.contact,
      email: announcer.user.email ?? null,
      creation_date: announcer.createdAt,
      bio: announcer.bio,
      verified: Boolean(announcer.verified),
      houses: 0,
      furnitures: 0,
    };
  }

  private async serializeMedia(media: any) {
    const signedFile = await this.objectStorage.getSignedUrl(media.bucket, media.originalPath);
    const signedThumbnail = media.thumbnailPath && media.thumbnailPath !== media.originalPath
      ? await this.objectStorage.getSignedUrl(media.bucket, media.thumbnailPath)
      : null;

    return {
      id: media.id,
      file: signedFile || storageUrl(media.file),
      thumbnail: signedThumbnail || storageUrl(media.thumbnail),
      type: media.type,
      announcer: await this.serializeAnnouncer(media.announcer),
      ads: 0,
    };
  }

  private serializeCategory(category: any, items = 0) {
    if (!category) return null;
    return {
      name: category.name,
      items,
      type: category.type,
      id: toNumber(category.id),
      creation_date: category.createdAt,
    };
  }

  async index(query: QueryAdsDto, currentUserId?: bigint) {
    if (query.AnnouncerId) {
      const where = { announcerId: query.AnnouncerId } satisfies Prisma.AdWhereInput;
      const page = Number(query.page || 1);
      const perPage = 15;
      const [ads, total] = await Promise.all([
        this.prisma.ad.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        this.prisma.ad.count({ where }),
      ]);

      const data = await this.serializeAds(ads, currentUserId);
      return buildLaravelPagination(data, {
        total,
        page,
        perPage,
        path: '/announces',
        query: query as object,
      });
    }

    const page = Number(query.page || 1);
    const perPage = 20;
    const realEstateIds = await this.findMatchingRealEstateIds(query);
    const where = this.buildAdWhere(query, realEstateIds);

    if (query.liked && currentUserId) {
      const favorites = await this.prisma.favorite.findMany({
        where: { userId: currentUserId },
        select: { adId: true },
      });
      Object.assign(where, { id: { in: favorites.map((item) => BigInt(item.adId)) } });
    }

    if (query.unlocked && currentUserId) {
      const unlockings = await this.prisma.unlocking.findMany({
        where: { userId: currentUserId, expiresAt: { gt: new Date() } },
        select: { adId: true },
      });
      Object.assign(where, { id: { in: unlockings.map((item) => BigInt(item.adId)) } });
    }

    const orderBy =
      query.orderBy === 'price'
        ? { price: 'asc' as const }
        : { createdAt: 'desc' as const };

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.ad.count({ where }),
    ]);

    const data = await this.serializeAds(ads, currentUserId);
    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path: '/announces',
      query: query as object,
    });
  }

  private async serializeAds(ads: any[], currentUserId?: bigint) {
    const relations = await this.loadRelations(ads);
    const categoryIds = Array.from(new Set(ads.map((ad) => ad.categoryId).filter(Boolean))) as string[];
    const groupedAds = categoryIds.length
      ? await this.prisma.ad.groupBy({ by: ['categoryId'], _count: { _all: true } })
      : [];
    const categoryItemCounts = new Map(
      groupedAds.map(
        (entry) => [entry.categoryId, entry._count._all] as MapPair<string | null, number>,
      ),
    );

    const favoriteIds = currentUserId
      ? new Set(
          (
            await this.prisma.favorite.findMany({
              where: { userId: currentUserId, adId: { in: ads.map((ad) => ad.id.toString()) } },
              select: { adId: true },
            })
          ).map((item) => item.adId),
        )
      : new Set<string>();
    const unlockedIds = currentUserId
      ? new Set(
          (
            await this.prisma.unlocking.findMany({
              where: {
                userId: currentUserId,
                adId: { in: ads.map((ad) => ad.id.toString()) },
                expiresAt: { gt: new Date() },
              },
              select: { adId: true },
            })
          ).map((item) => item.adId),
        )
      : new Set<string>();

    return Promise.all(ads.map(async (ad) => {
      const category = ad.categoryId ? relations.categories.get(ad.categoryId) : null;
      const mediaEntries = relations.adMedias.get(ad.id.toString()) || [];
      const medias = await Promise.all(mediaEntries
        .map((entry) => relations.medias.get(entry.mediaId))
        .filter(Boolean)
        .map((media) => this.serializeMedia(media)));

      return {
        id: toNumber(ad.id),
        type: itemTypeToApiType(ad.itemType),
        description: ad.description,
        price: toNumber(ad.price),
        medias,
        ad_type: ad.adType,
        period: ad.period,
        devise: ad.devise,
        address: ad.adress,
        city: ad.city,
        neighbourhood: ad.neighbourhood,
        country: ad.country,
        postal_code: ad.zip,
        contact_phone: ad.contactPhone,
        contact_email: ad.contactEmail,
        category: this.serializeCategory(category, category ? categoryItemCounts.get(ad.categoryId) || 0 : 0),
        creation_date: ad.createdAt,
        liked: favoriteIds.has(ad.id.toString()),
        unlocked: unlockedIds.has(ad.id.toString()),
      };
    }));
  }

  async show(id: string, currentUserId?: bigint) {
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(id) } });
    if (!ad) throw new NotFoundException('Ad not found');

    const relations = await this.loadRelations([ad]);
    const category = ad.categoryId ? relations.categories.get(ad.categoryId) : null;
    const announcer = relations.announcers.get(ad.announcerId);
    const mediaEntries = relations.adMedias.get(ad.id.toString()) || [];
    const medias = await Promise.all(mediaEntries
      .map((entry) => relations.medias.get(entry.mediaId))
      .filter(Boolean)
      .map((media) => this.serializeMedia(media)));

    const [isLiked, unlocking] = currentUserId
      ? await Promise.all([
          this.prisma.favorite.findFirst({ where: { userId: currentUserId, adId: id } }),
          this.prisma.unlocking.findFirst({
            where: { userId: currentUserId, adId: id, expiresAt: { gt: new Date() } },
            orderBy: [{ unlockedAt: 'desc' }, { createdAt: 'desc' }],
          }),
        ])
      : [null, null];

    const base = {
      id: toNumber(ad.id),
      type: itemTypeToApiType(ad.itemType),
      description: ad.description,
      price: toNumber(ad.price),
      medias,
      ad_type: ad.adType,
      period: ad.period,
      devise: ad.devise,
      address: ad.adress,
      city: ad.city,
      neighbourhood: ad.neighbourhood,
      country: ad.country,
      postal_code: ad.zip,
      contact_phone: ad.contactPhone,
      contact_email: ad.contactEmail,
      category: this.serializeCategory(category),
      announcer: announcer ? await this.serializeAnnouncer(announcer) : null,
      creation_date: ad.createdAt,
      liked: Boolean(isLiked),
      unlocked: Boolean(unlocking),
      is_owner: false,
    } as Record<string, unknown>;

    if (ad.itemType === REAL_ESTATE_CLASS) {
      const realEstate: any = relations.realEstates.get(ad.adId.toString());
      Object.assign(base, {
        bedroom: realEstate ? toNumber(realEstate.bedroom) : 0,
        toilet: realEstate ? toNumber(realEstate.toilet) : 0,
        kitchen: realEstate ? toNumber(realEstate.kitchen) : 0,
        mainroom: realEstate ? toNumber(realEstate.mainroom) : 0,
        size: realEstate ? toNumber(realEstate.size) : null,
        garden: realEstate ? boolFromUnknown(realEstate.garden) : false,
        gate: realEstate ? boolFromUnknown(realEstate.gate) : false,
        wifi: realEstate ? boolFromUnknown(realEstate.wifi) : false,
        air_conditioning: realEstate ? boolFromUnknown(realEstate.airConditioning) : false,
        security_24h: realEstate ? boolFromUnknown(realEstate.security24h) : false,
        smart_tv: realEstate ? boolFromUnknown(realEstate.smartTv) : false,
        equipped_kitchen: realEstate ? boolFromUnknown(realEstate.equippedKitchen) : false,
        pool: realEstate ? boolFromUnknown(realEstate.pool) : false,
        caution: realEstate ? toNumber(realEstate.caution) : null,
        longitude: realEstate ? toNumber(realEstate.lng) : null,
        latitude: realEstate ? toNumber(realEstate.lat) : null,
      });
    }

    if (ad.itemType === FURNITURE_CLASS) {
      const furniture: any = relations.furnitures.get(ad.adId.toString());
      Object.assign(base, {
        height: furniture ? toNumber(furniture.height) : null,
        width: furniture ? toNumber(furniture.width) : null,
        length: furniture ? toNumber(furniture.length) : null,
        weight: furniture ? toNumber(furniture.weight) : null,
      });
    }

    return base;
  }

  async cities(query: QueryCitiesDto) {
    const where: Prisma.AdWhereInput = {
      city: { not: '' },
      ...(query.search ? { city: { contains: query.search } } : {}),
      ...(query.country ? { country: { contains: query.country } } : {}),
      ...(query.ad_type ? { adType: query.ad_type } : {}),
      ...(query.type
        ? { itemType: query.type === 'furniture' ? FURNITURE_CLASS : REAL_ESTATE_CLASS }
        : {}),
      ...(query.category_id?.length ? { categoryId: { in: query.category_id } } : {}),
    };

    let rows = await this.prisma.ad.groupBy({
      by: ['city', 'country'],
      where,
      _count: { _all: true },
      orderBy: [{ city: 'asc' }, { country: 'asc' }],
      take: Math.min(Number(query.limit || 8), 50),
    });

    rows = rows.sort((a, b) => {
      if (query.order_by === 'name') {
        const compared = a.city.localeCompare(b.city);
        return (query.order || 'asc') === 'desc' ? compared * -1 : compared;
      }

      const compared = a._count._all - b._count._all;
      return (query.order || 'desc') === 'asc' ? compared : compared * -1;
    });

    return {
      success: true,
      data: rows.map((row) => ({
        city: row.city,
        country: row.country,
        ...(boolFromUnknown(query.with_count ?? true) ? { ads_count: row._count._all } : {}),
      })),
    };
  }

  async toggleLike(adId: string, userId: bigint) {
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(adId) } });
    if (!ad) throw new NotFoundException('Ad not found');

    const existing = await this.prisma.favorite.findFirst({
      where: { userId, adId },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { message: 'Ad removed from favorites successfully', liked: false };
    }

    await this.prisma.favorite.create({
      data: { userId, adId },
    });
    return { message: 'Ad added to favorites successfully', liked: true };
  }

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

  async unlockAd(adId: string, userId: bigint) {
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(adId) } });
    if (!ad) throw new NotFoundException('Ad not found');

    const existing = await this.prisma.unlocking.findFirst({
      where: { userId, adId, expiresAt: { gt: new Date() } },
      orderBy: [{ unlockedAt: 'desc' }, { createdAt: 'desc' }],
    });
    if (existing) {
      return { message: 'Annonce deja debloquee' };
    }

    const now = new Date();

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        credits: { gt: 0 },
        OR: [
          { expireAt: { gt: now } },
          { AND: [{ expireAt: null }, { endDate: { gt: now } }] },
          { AND: [{ expireAt: null }, { endDate: null }] },
        ],
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });
    if (!subscription) {
      return { message: 'Domicoins insuffisants' };
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { credits: { decrement: 1 } },
    });

    const unlocking = await this.prisma.unlocking.create({
      data: {
        userId,
        adId,
        unlockedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'ad_unlocked',
        title: 'Annonce debloquee',
        message: 'Vous pouvez maintenant consulter les informations de contact de cette annonce pendant 7 jours.',
        link: `/houses/${ad.id}`,
      },
    }).catch(() => undefined);

    return {
      message: 'Annonce debloquee avec succes',
      unlocking,
      remaining_credits: await this.totalCreditsForUser(userId),
    };
  }

  async create(body: Record<string, any>, files: any[], userId: bigint) {
    const announcer = await this.ensureAnnouncerUser(userId);

    const type = body.type;
    const mediaUrls = [body.media_urls, body['media_urls[]']]
      .flat()
      .filter(Boolean) as string[];
    const mediaThumbnails = [body.media_thumbnails, body['media_thumbnails[]']]
      .flat()
      .filter(Boolean) as string[];
    const mediaTypes = [body.media_types, body['media_types[]']]
      .flat()
      .filter(Boolean) as string[];
    const mediaBuckets = [body.media_buckets, body['media_buckets[]']]
      .flat()
      .filter(Boolean) as string[];
    const mediaOriginalPaths = [body.media_original_paths, body['media_original_paths[]']]
      .flat()
      .filter(Boolean) as string[];
    const mediaThumbnailPaths = [body.media_thumbnail_paths, body['media_thumbnail_paths[]']]
      .flat()
      .filter(Boolean) as string[];
    const filesId = Array.isArray(body.filesid)
      ? body.filesid
      : body.filesid
        ? [body.filesid]
        : [];
    const mediaIds = [body.media_ids, body['media_ids[]']]
      .flat()
      .filter(Boolean) as string[];
    const existingMediaIds = [...filesId, ...mediaIds];
    const totalMediaCount = files.length + existingMediaIds.length + mediaUrls.length;
    if (totalMediaCount > MAX_AD_MEDIAS) {
      throw new ForbiddenException(`The combined total of medias and mediasId must not exceed ${MAX_AD_MEDIAS}.`);
    }
    if (totalMediaCount === 0) {
      throw new ForbiddenException('At least one media file is required.');
    }

    const localization = Array.isArray(body.localization)
      ? body.localization
      : body['localization[]']
        ? [body['localization[]']]
        : undefined;
    const localizationValues = Array.isArray(localization)
      ? localization.map((value) => Number(value))
      : [];
    const longitude = Number.isFinite(localizationValues[0]) ? localizationValues[0] : null;
    const latitude = Number.isFinite(localizationValues[1]) ? localizationValues[1] : null;
    if (
      (longitude !== null && (longitude < -180 || longitude > 180)) ||
      (latitude !== null && (latitude < -90 || latitude > 90))
    ) {
      throw new BadRequestException('Coordonnees GPS invalides.');
    }
    const resolvedAddress = await this.resolveAddressFromCoordinates(longitude, latitude);

    let adableId: bigint;
    if (type === 'furniture') {
      const furniture = await this.prisma.furniture.create({
        data: {
          clientId: crypto.randomUUID(),
          height: body.height ? Number(body.height) : null,
          width: body.width ? Number(body.width) : null,
          length: body.length ? Number(body.length) : null,
          weight: body.weight ? Number(body.weight) : null,
        },
      });
      adableId = furniture.id;
    } else {
      const realEstate = await this.prisma.realEstate.create({
        data: {
          bedroom: Number(body.bedroom || 0),
          mainroom: Number(body.mainroom || 0),
          toilet: Number(body.toilet || 0),
          kitchen: Number(body.kitchen || 0),
          size: body.size ? Number(body.size) : null,
          gate: ['1', 'true', true].includes(body.gate),
          wifi: ['1', 'true', true].includes(body.wifi),
          airConditioning: ['1', 'true', true].includes(body.air_conditioning),
          security24h: ['1', 'true', true].includes(body.security_24h),
          smartTv: ['1', 'true', true].includes(body.smart_tv),
          equippedKitchen: ['1', 'true', true].includes(body.equipped_kitchen),
          pool: ['1', 'true', true].includes(body.pool),
          garage: ['1', 'true', true].includes(body.garage),
          furnished: ['1', 'true', true].includes(body.furnitured),
          garden: ['1', 'true', true].includes(body.garden),
          caution: body.caution ? Number(body.caution) : null,
          lng: longitude,
          lat: latitude,
        },
      });
      adableId = realEstate.id;
    }

    const ad = await this.prisma.ad.create({
      data: {
        clientId: crypto.randomUUID(),
        adress: resolvedAddress?.address || body.address || '',
        city: resolvedAddress?.city || body.city || '',
        neighbourhood: resolvedAddress?.neighbourhood || body.neighbourhood || '',
        country: resolvedAddress?.country || body.country || '',
        state: resolvedAddress?.state || body.state || '',
        zip: resolvedAddress?.zip || body.zip || '',
        devise: this.normalizeDevise(body.devise) || 'XOF',
        itemType: type === 'furniture' ? FURNITURE_CLASS : REAL_ESTATE_CLASS,
        price: Number(body.price),
        adType: body.ad_type,
        adId: adableId,
        announcerId: announcer.id,
        categoryId: body.category_id !== undefined && body.category_id !== null && body.category_id !== ''
          ? String(body.category_id)
          : null,
        period: this.normalizePeriod(body.period) || 'month',
        description: body.description || null,
        contactPhone: this.optionalString(body.contact_phone),
        contactEmail: this.optionalString(body.contact_email),
      },
    });

    const createdMediaIds: string[] = [];
    if (existingMediaIds.length) {
      const ownedMedias = await this.prisma.media.findMany({
        where: {
          id: { in: existingMediaIds },
          announcerId: announcer.id,
          purpose: 'ad_media',
        },
        select: { id: true },
      });
      if (ownedMedias.length !== new Set(existingMediaIds).size) {
        throw new ForbiddenException('Un ou plusieurs medias sont invalides.');
      }
    }

    for (const [index, mediaUrl] of mediaUrls.entries()) {
      const media = await this.prisma.media.create({
        data: {
          id: crypto.randomUUID(),
          file: mediaUrl,
          thumbnail: mediaThumbnails[index] || mediaUrl,
          bucket: mediaBuckets[index] || null,
          originalPath: mediaOriginalPaths[index] || null,
          thumbnailPath: mediaThumbnailPaths[index] || mediaOriginalPaths[index] || null,
          purpose: 'ad_media',
          type: mediaTypes[index] || 'application/octet-stream',
          announcerId: announcer.id,
        },
      });
      createdMediaIds.push(media.id);
    }

    for (const file of files) {
      await validateUploadedFile(file, {
        allowImages: true,
        allowVideos: true,
        maxSize: 50 * 1024 * 1024,
        context: 'ads.create',
      });
      const uploaded = await this.objectStorage.uploadFile(file, 'medias');
      const thumbnailBuffer = await generateMediaThumbnailBuffer(file).catch(() => null);
      const thumbnail = thumbnailBuffer
        ? await this.objectStorage.uploadThumbnail(thumbnailBuffer, file).catch(() => null)
        : null;
      const media = await this.prisma.media.create({
        data: {
          id: crypto.randomUUID(),
          file: uploaded.url,
          thumbnail: thumbnail?.url || '',
          bucket: uploaded.bucket,
          originalPath: uploaded.path,
          thumbnailPath: thumbnail?.path || null,
          purpose: 'ad_media',
          size: file.size,
          originalName: file.originalname,
          type: file.mimetype,
          announcerId: announcer.id,
        },
      });
      createdMediaIds.push(media.id);
    }

    const attachIds = [...createdMediaIds, ...existingMediaIds];
    for (const [index, mediaId] of attachIds.entries()) {
      await this.prisma.adMedia.create({
        data: {
          adId: String(ad.id),
          mediaId: String(mediaId),
          isPresentation: index === 0,
        },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'ad_published',
        title: 'Annonce publiee',
        message: 'Votre annonce a ete publiee avec succes sur Domilix.',
        link: `/houses/${ad.id}`,
      },
    }).catch(() => undefined);

    const [serialized] = await this.serializeAds([ad], userId);
    return serialized;
  }

  async updateAd(id: string, body: Record<string, any>, userId: bigint) {
    const announcer = await this.ensureAnnouncerUser(userId);
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(id) } });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.announcerId !== announcer.id) {
      throw new ForbiddenException('Unauthorized');
    }

    const localization = Array.isArray(body.localization)
      ? body.localization
      : body['localization[]']
        ? [body['localization[]']]
        : undefined;
    const localizationValues = Array.isArray(localization)
      ? localization.map((value) => Number(value))
      : [];
    const hasLocalization = localizationValues.length >= 2;
    const longitude = hasLocalization && Number.isFinite(localizationValues[0]) ? localizationValues[0] : null;
    const latitude = hasLocalization && Number.isFinite(localizationValues[1]) ? localizationValues[1] : null;
    if (
      (longitude !== null && (longitude < -180 || longitude > 180)) ||
      (latitude !== null && (latitude < -90 || latitude > 90))
    ) {
      throw new BadRequestException('Coordonnees GPS invalides.');
    }
    const resolvedAddress = hasLocalization
      ? await this.resolveAddressFromCoordinates(longitude, latitude)
      : null;

    const updated = await this.prisma.ad.update({
      where: { id: ad.id },
      data: {
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.contact_phone !== undefined ? { contactPhone: this.optionalString(body.contact_phone) } : {}),
        ...(body.contact_email !== undefined ? { contactEmail: this.optionalString(body.contact_email) } : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(hasLocalization && resolvedAddress?.address ? { adress: resolvedAddress.address } : body.address !== undefined ? { adress: body.address } : {}),
        ...(hasLocalization && resolvedAddress?.city ? { city: resolvedAddress.city } : body.city !== undefined ? { city: body.city } : {}),
        ...(hasLocalization && resolvedAddress?.neighbourhood ? { neighbourhood: resolvedAddress.neighbourhood } : body.neighbourhood !== undefined ? { neighbourhood: body.neighbourhood } : {}),
        ...(hasLocalization && resolvedAddress?.state ? { state: resolvedAddress.state } : body.state !== undefined ? { state: body.state } : {}),
        ...(hasLocalization && resolvedAddress?.country ? { country: resolvedAddress.country } : body.country !== undefined ? { country: body.country } : {}),
        ...(hasLocalization && resolvedAddress?.zip ? { zip: resolvedAddress.zip } : body.zip !== undefined ? { zip: body.zip } : {}),
        ...(body.period !== undefined && this.normalizePeriod(body.period)
          ? { period: this.normalizePeriod(body.period) }
          : {}),
        ...(body.devise !== undefined && this.normalizeDevise(body.devise)
          ? { devise: this.normalizeDevise(body.devise) }
          : {}),
      },
    });

    if (ad.itemType === FURNITURE_CLASS) {
      await this.prisma.furniture.update({
        where: { id: ad.adId },
        data: {
          ...(body.height !== undefined ? { height: Number(body.height) } : {}),
          ...(body.width !== undefined ? { width: Number(body.width) } : {}),
          ...(body.length !== undefined ? { length: Number(body.length) } : {}),
          ...(body.weight !== undefined ? { weight: Number(body.weight) } : {}),
        },
      });
    } else {
      await this.prisma.realEstate.update({
        where: { id: ad.adId },
        data: {
          ...(body.toilet !== undefined ? { toilet: Number(body.toilet) } : {}),
          ...(body.kitchen !== undefined ? { kitchen: Number(body.kitchen) } : {}),
          ...(body.bedroom !== undefined ? { bedroom: Number(body.bedroom) } : {}),
          ...(body.mainroom !== undefined ? { mainroom: Number(body.mainroom) } : {}),
          ...(body.size !== undefined ? { size: body.size ? Number(body.size) : null } : {}),
          ...(body.gate !== undefined ? { gate: ['1', 'true', true].includes(body.gate) } : {}),
          ...(body.wifi !== undefined ? { wifi: ['1', 'true', true].includes(body.wifi) } : {}),
          ...(body.air_conditioning !== undefined
            ? { airConditioning: ['1', 'true', true].includes(body.air_conditioning) }
            : {}),
          ...(body.security_24h !== undefined
            ? { security24h: ['1', 'true', true].includes(body.security_24h) }
            : {}),
          ...(body.smart_tv !== undefined
            ? { smartTv: ['1', 'true', true].includes(body.smart_tv) }
            : {}),
          ...(body.equipped_kitchen !== undefined
            ? { equippedKitchen: ['1', 'true', true].includes(body.equipped_kitchen) }
            : {}),
          ...(body.pool !== undefined ? { pool: ['1', 'true', true].includes(body.pool) } : {}),
          ...(body.garage !== undefined ? { garage: ['1', 'true', true].includes(body.garage) } : {}),
          ...(body.furnitured !== undefined
            ? { furnished: ['1', 'true', true].includes(body.furnitured) }
            : {}),
          ...(body.garden !== undefined ? { garden: ['1', 'true', true].includes(body.garden) } : {}),
          ...(body.caution !== undefined ? { caution: Number(body.caution) } : {}),
          ...(hasLocalization ? { lng: longitude, lat: latitude } : {}),
        },
      });
    }

    return this.show(String(updated.id), userId);
  }

  async destroyAd(id: string, userId: bigint) {
    const announcer = await this.ensureAnnouncerUser(userId);
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(id) } });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.announcerId !== announcer.id) {
      throw new ForbiddenException('Unauthorized');
    }

    await this.prisma.adMedia.deleteMany({ where: { adId: id } });
    await this.prisma.ad.delete({ where: { id: ad.id } });
    if (ad.itemType === FURNITURE_CLASS) {
      await this.prisma.furniture.delete({ where: { id: ad.adId } });
    } else {
      await this.prisma.realEstate.delete({ where: { id: ad.adId } });
    }
    return null;
  }
}
