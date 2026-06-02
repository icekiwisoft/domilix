import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CategoriesService } from '../../categories/categories.service';
import { CreateCategoryDto } from '../../categories/dto/create-category.dto';
import { QueryCategoriesDto } from '../../categories/dto/query-categories.dto';
import { UpdateCategoryDto } from '../../categories/dto/update-category.dto';

type AdminUser = {
  id: bigint;
  isAdmin?: boolean;
};

@ApiTags('Admin Categories')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  private ensureAdmin(user: AdminUser) {
    if (!user.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List categories (admin)' })
  index(@CurrentUser() user: AdminUser, @Query() query: QueryCategoriesDto) {
    this.ensureAdmin(user);
    return this.categoriesService.index(query, '/admin/categories');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.categoriesService.show(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@CurrentUser() user: AdminUser, @Body() dto: CreateCategoryDto) {
    this.ensureAdmin(user);
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    this.ensureAdmin(user);
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    this.ensureAdmin(user);
    await this.categoriesService.destroy(id);
    return res.status(204).send();
  }
}
