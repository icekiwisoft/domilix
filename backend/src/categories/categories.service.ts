import crypto from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { buildLaravelPagination } from '../common/http/pagination';
import { toNumber } from '../common/http/formatters';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async serialize(category: any) {
    const items = await this.prisma.ad.count({
      where: { categoryId: String(category.id) },
    });

    return {
      name: category.name,
      items,
      type: category.type,
      id: toNumber(category.id),
      creation_date: category.createdAt,
      updated_at: category.updatedAt,
    };
  }

  async index(query: QueryCategoriesDto, path = '/categories') {
    const page = Number(query.page || 1);
    const perPage = Math.min(100, Math.max(1, Number(query.per_page || 20)));

    const where = {
      ...(query.search
        ? {
            name: {
              contains: query.search,
            },
          }
        : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const orderBy = query.orderBy
      ? { [query.orderBy]: 'asc' as const }
      : { id: 'asc' as const };

    const [categories, total, groupedAds] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.category.count({ where }),
      this.prisma.ad.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
      }),
    ]);

    const itemCountByCategory = new Map(
      groupedAds.map((entry) => [entry.categoryId, entry._count._all]),
    );

    const data = categories.map((category) => ({
      name: category.name,
      items: itemCountByCategory.get(String(category.id)) || 0,
      type: category.type,
      id: toNumber(category.id),
      creation_date: category.createdAt,
    }));

    return buildLaravelPagination(data, {
      total,
      page,
      perPage,
      path,
      query: query as object,
    });
  }

  async show(id: string) {
    const category = await this.prisma.category.findUniqueOrThrow({
      where: { id: BigInt(id) },
    });

    const items = await this.prisma.ad.count({
      where: { categoryId: String(category.id) },
    });

    return {
      name: category.name,
      items,
      type: category.type,
      id: toNumber(category.id),
      creation_date: category.createdAt,
      updated_at: category.updatedAt,
    };
  }

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Le nom est requis');

    const existing = await this.prisma.category.findUnique({ where: { name } });
    if (existing) throw new BadRequestException('Cette catégorie existe déjà');

    const category = await this.prisma.category.create({
      data: {
        clientId: crypto.randomUUID(),
        name,
        type: dto.type,
      },
    });

    return this.serialize(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: BigInt(id) },
    });
    if (!category) throw new NotFoundException('Catégorie introuvable');

    const data: { name?: string; type?: 'house' | 'furniture' } = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException('Le nom est requis');
      const existing = await this.prisma.category.findUnique({ where: { name } });
      if (existing && existing.id !== category.id) {
        throw new BadRequestException('Cette catégorie existe déjà');
      }
      data.name = name;
    }
    if (dto.type !== undefined) data.type = dto.type;

    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data,
    });

    return this.serialize(updated);
  }

  async destroy(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: BigInt(id) },
    });
    if (!category) throw new NotFoundException('Catégorie introuvable');

    const items = await this.prisma.ad.count({
      where: { categoryId: String(category.id) },
    });
    if (items > 0) {
      throw new BadRequestException(
        'Impossible de supprimer une catégorie utilisée par des annonces',
      );
    }

    await this.prisma.category.delete({ where: { id: category.id } });
  }
}
