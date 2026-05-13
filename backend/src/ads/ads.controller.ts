import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from '../auth/auth-token.service';
import { AdsService } from './ads.service';
import { QueryAdsDto } from './dto/query-ads.dto';
import { QueryCitiesDto } from './dto/query-cities.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { assertHoneypotClear } from '../common/honeypot';
import { ALLOWED_MEDIA_MIME_PATTERN, MAX_AD_MEDIAS } from '../common/media/thumbnails';

@ApiTags('Ads')
@Controller()
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly tokens: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveUserId(request: any) {
    const authorization = request.headers.authorization as string | undefined;
    if (!authorization?.startsWith('Bearer ')) return undefined;

    try {
      const payload = this.tokens.verifyAccessToken(authorization.slice(7));
      const user = await this.prisma.user.findUnique({ where: { id: BigInt(payload.sub) } });
      return user?.id;
    } catch {
      return undefined;
    }
  }

  @Get('announces')
  @ApiOperation({ summary: 'List announces with filters and pagination' })
  async index(@Query() query: QueryAdsDto, @Req() req: any) {
    return this.adsService.index(query, await this.resolveUserId(req));
  }

  @Get('announces/:id')
  @ApiOperation({ summary: 'Get announce details' })
  @ApiParam({ name: 'id', example: '1' })
  async show(@Param('id') id: string, @Req() req: any) {
    return this.adsService.show(id, await this.resolveUserId(req));
  }

  @Get('cities')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'List cities having announces' })
  cities(@Query() query: QueryCitiesDto) {
    return this.adsService.cities(query);
  }

  @UseGuards(AuthGuard)
  @Patch('announces/:id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or unlike an announce' })
  @ApiParam({ name: 'id', example: '1' })
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.toggleLike(id, user.id);
  }

  @UseGuards(AuthGuard)
  @Post('announces/:id/unlock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock an announce with available credits' })
  @ApiParam({ name: 'id', example: '1' })
  unlock(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.unlockAd(id, user.id);
  }

  @UseGuards(AuthGuard)
  @Post('announces')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new announce with optional uploaded medias' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['realestate', 'furniture'] },
        price: { type: 'string' },
        ad_type: { type: 'string', enum: ['location', 'sale'] },
        category_id: { type: 'string' },
        description: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        zip: { type: 'string' },
        wifi: { type: 'string', enum: ['0', '1'] },
        air_conditioning: { type: 'string', enum: ['0', '1'] },
        security_24h: { type: 'string', enum: ['0', '1'] },
        smart_tv: { type: 'string', enum: ['0', '1'] },
        equipped_kitchen: { type: 'string', enum: ['0', '1'] },
        gate: { type: 'string', enum: ['0', '1'] },
        pool: { type: 'string', enum: ['0', '1'] },
        size: { type: 'string', description: 'Real estate size in square meters' },
        'medias[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('medias[]', MAX_AD_MEDIAS, {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        callback(
          ALLOWED_MEDIA_MIME_PATTERN.test(file.mimetype)
            ? null
            : new Error('Only image and video medias are allowed.'),
          ALLOWED_MEDIA_MIME_PATTERN.test(file.mimetype),
        );
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  create(@CurrentUser() user: any, @Body() body: any, @UploadedFiles() files: any[] = []) {
    assertHoneypotClear(body.website, 'ads.create');
    return this.adsService.create(body, files, user.id);
  }

  @UseGuards(AuthGuard)
  @Put('announces/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announce' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.adsService.updateAd(id, body, user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('announces/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announce' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(@Param('id') id: string, @CurrentUser() user: any, @Res() res: any) {
    await this.adsService.destroyAd(id, user.id);
    return res.status(204).send();
  }
}
