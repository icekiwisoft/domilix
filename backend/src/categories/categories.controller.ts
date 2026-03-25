import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories with optional filters' })
  @ApiOkResponse({ description: 'Paginated categories list' })
  index(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@Param('id') id: string) {
    return this.categoriesService.show(id);
  }
}
