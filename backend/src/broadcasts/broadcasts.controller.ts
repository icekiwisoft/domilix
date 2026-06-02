import {
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BroadcastsService } from './broadcasts.service';
import { QueryBroadcastsDto } from './dto/query-broadcasts.dto';

@ApiTags('Broadcasts')
@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'List homepage broadcasts' })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  index(@Query() query: QueryBroadcastsDto) {
    return this.broadcastsService.index(query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get broadcast details' })
  @ApiParam({ name: 'id', example: '1' })
  show(@Param('id') id: string) {
    return this.broadcastsService.show(id);
  }
}
