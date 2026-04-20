import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import {
  boolFromUnknown,
  itemTypeToApiType,
  storageUrl,
  toNumber,
} from '../common/http/formatters';
import { buildLaravelPagination } from '../common/http/pagination';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

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
        if (amenity === 'pool') where.pool = true;
        if (amenity === 'garage') where.garage = true;
        if (amenity === 'furnitured') where.furnished = true;
      }
    }

    const realEstates = await this.prisma.realEstate.findMany({ where, select: { id: true, gate: true, pool: true, garage: true, furnished: true } });

    const filtered = realEstates.filter((entry) => {
      if (!query.standing) return true;
      const count = [entry.gate, entry.pool, entry.garage, entry.furnished].filter(Boolean).length;
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

  private serializeAnnouncer(announcer: any) {
    return {
      id: announcer.id,
      name: announcer.name,
      user: this.serializeUser(announcer.user, announcer.id),
      avatar: storageUrl(announcer.avatar),
      contact: announcer.contact,
      email: announcer.user.email ?? null,
      creation_date: announcer.createdAt,
      bio: announcer.bio,
      verified: Boolean(announcer.verified),
      houses: 0,
      furnitures: 0,
    };
  }

  private serializeMedia(media: any) {
    return {
      id: media.id,
      file: storageUrl(media.file),
      thumbnail: storageUrl(media.thumbnail),
      type: media.type,
      announcer: this.serializeAnnouncer(media.announcer),
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

    return ads.map((ad) => {
      const category = ad.categoryId ? relations.categories.get(ad.categoryId) : null;
      const mediaEntries = relations.adMedias.get(ad.id.toString()) || [];
      const medias = mediaEntries
        .map((entry) => relations.medias.get(entry.mediaId))
        .filter(Boolean)
        .map((media) => this.serializeMedia(media));

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
        country: ad.country,
        postal_code: ad.zip,
        category: this.serializeCategory(category, category ? categoryItemCounts.get(ad.categoryId) || 0 : 0),
        creation_date: ad.createdAt,
        liked: favoriteIds.has(ad.id.toString()),
        unlocked: unlockedIds.has(ad.id.toString()),
      };
    });
  }

  async show(id: string, currentUserId?: bigint) {
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(id) } });
    if (!ad) throw new NotFoundException('Ad not found');

    const relations = await this.loadRelations([ad]);
    const category = ad.categoryId ? relations.categories.get(ad.categoryId) : null;
    const announcer = relations.announcers.get(ad.announcerId);
    const mediaEntries = relations.adMedias.get(ad.id.toString()) || [];
    const medias = mediaEntries
      .map((entry) => relations.medias.get(entry.mediaId))
      .filter(Boolean)
      .map((media) => this.serializeMedia(media));

    const [isLiked, unlocking] = currentUserId
      ? await Promise.all([
          this.prisma.favorite.findFirst({ where: { userId: currentUserId, adId: id } }),
          this.prisma.unlocking.findFirst({
            where: { userId: currentUserId, adId: id, expiresAt: { gt: new Date() } },
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
      country: ad.country,
      postal_code: ad.zip,
      category: this.serializeCategory(category),
      announcer: announcer ? this.serializeAnnouncer(announcer) : null,
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
        garden: realEstate ? boolFromUnknown(realEstate.garden) : false,
        gate: realEstate ? boolFromUnknown(realEstate.gate) : false,
        pool: realEstate ? boolFromUnknown(realEstate.pool) : false,
        caution: realEstate ? toNumber(realEstate.caution) : null,
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
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId, credits: { gt: 0 }, expireAt: { gt: new Date() } },
      select: { credits: true },
    });
    return subscriptions.reduce((sum, item) => sum + item.credits, 0);
  }

  async unlockAd(adId: string, userId: bigint) {
    const ad = await this.prisma.ad.findUnique({ where: { id: BigInt(adId) } });
    if (!ad) throw new NotFoundException('Ad not found');

    const existing = await this.prisma.unlocking.findFirst({
      where: { userId, adId, expiresAt: { gt: new Date() } },
    });
    if (existing) {
      return { message: 'Annonce deja debloquee' };
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, credits: { gt: 0 }, expireAt: { gt: new Date() } },
      orderBy: { expireAt: 'asc' },
    });
    if (!subscription) {
      return { message: 'Crédits insuffisants' };
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

    return {
      message: 'Annonce debloquee avec succes',
      unlocking,
      remaining_credits: await this.totalCreditsForUser(userId),
    };
  }

  async create(body: Record<string, any>, files: any[], userId: bigint) {
    const announcer = await this.ensureAnnouncerUser(userId);

    const type = body.type;
    const filesId = Array.isArray(body.filesid)
      ? body.filesid
      : body.filesid
        ? [body.filesid]
        : [];
    const totalMediaCount = files.length + filesId.length;
    if (totalMediaCount > 5) {
      throw new ForbiddenException('The combined total of medias and mediasId must not exceed 5.');
    }
    if (totalMediaCount === 0) {
      throw new ForbiddenException('At least one media file is required.');
    }

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
      const localization = Array.isArray(body.localization)
        ? body.localization
        : body['localization[]']
          ? [body['localization[]']]
          : undefined;
      const localizationValues = Array.isArray(localization)
        ? localization.map((value) => Number(value))
        : [];

      const realEstate = await this.prisma.realEstate.create({
        data: {
          bedroom: Number(body.bedroom || 0),
          mainroom: Number(body.mainroom || 0),
          toilet: Number(body.toilet || 0),
          kitchen: Number(body.kitchen || 0),
          gate: ['1', 'true', true].includes(body.gate),
          pool: ['1', 'true', true].includes(body.pool),
          garage: ['1', 'true', true].includes(body.garage),
          furnished: ['1', 'true', true].includes(body.furnitured),
          garden: ['1', 'true', true].includes(body.garden),
          caution: body.caution ? Number(body.caution) : null,
          lng: localizationValues[0] ?? null,
          lat: localizationValues[1] ?? null,
        },
      });
      adableId = realEstate.id;
    }

    const ad = await this.prisma.ad.create({
      data: {
        clientId: crypto.randomUUID(),
        adress: body.address || '',
        city: body.city || '',
        country: body.country || '',
        state: body.state || '',
        zip: body.zip || '',
        devise: this.normalizeDevise(body.devise) || 'XOF',
        itemType: type === 'furniture' ? FURNITURE_CLASS : REAL_ESTATE_CLASS,
        price: Number(body.price),
        adType: body.ad_type,
        adId: adableId,
        announcerId: announcer.id,
        categoryId: body.category_id,
        period: this.normalizePeriod(body.period) || 'month',
        description: body.description || null,
      },
    });

    const createdMediaIds: string[] = [];
    for (const file of files) {
      const media = await this.prisma.media.create({
        data: {
          id: crypto.randomUUID(),
          file: `public/medias/${file.filename}`,
          thumbnail: `public/medias/${file.filename}`,
          type: file.mimetype,
          announcerId: announcer.id,
        },
      });
      createdMediaIds.push(media.id);
    }

    const attachIds = [...createdMediaIds, ...filesId];
    for (const [index, mediaId] of attachIds.entries()) {
      await this.prisma.adMedia.create({
        data: {
          adId: String(ad.id),
          mediaId: String(mediaId),
          isPresentation: index === 0,
        },
      });
    }

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

    const updated = await this.prisma.ad.update({
      where: { id: ad.id },
      data: {
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.address !== undefined ? { adress: body.address } : {}),
        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.state !== undefined ? { state: body.state } : {}),
        ...(body.country !== undefined ? { country: body.country } : {}),
        ...(body.zip !== undefined ? { zip: body.zip } : {}),
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
          ...(body.gate !== undefined ? { gate: ['1', 'true', true].includes(body.gate) } : {}),
          ...(body.pool !== undefined ? { pool: ['1', 'true', true].includes(body.pool) } : {}),
          ...(body.garage !== undefined ? { garage: ['1', 'true', true].includes(body.garage) } : {}),
          ...(body.furnitured !== undefined
            ? { furnished: ['1', 'true', true].includes(body.furnitured) }
            : {}),
          ...(body.garden !== undefined ? { garden: ['1', 'true', true].includes(body.garden) } : {}),
          ...(body.caution !== undefined ? { caution: Number(body.caution) } : {}),
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
