import {
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { BroadcastsService } from './broadcasts.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
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

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a broadcast (admin)' })
  create(@CurrentUser() user: any, @Body() dto: CreateBroadcastDto) {
    return this.broadcastsService.create(user, dto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a broadcast (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateBroadcastDto,
  ) {
    return this.broadcastsService.update(user, id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a broadcast (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(@CurrentUser() user: any, @Param('id') id: string, @Res() res: any) {
    await this.broadcastsService.destroy(user, id);
    return res.status(204).send();
  }
}
