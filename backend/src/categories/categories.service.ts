import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { buildLaravelPagination } from '../common/http/pagination';
import { toNumber } from '../common/http/formatters';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async index(query: QueryCategoriesDto) {
    const page = Number(query.page || 1);
    const perPage = 20;

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

    const orderBy = query.orderBy ? { [query.orderBy]: 'asc' as const } : { id: 'asc' as const };

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
      path: '/categories',
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
    };
  }
}
