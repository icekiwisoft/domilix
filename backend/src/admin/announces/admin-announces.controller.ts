import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { AdsService } from '../../ads/ads.service';
import { QueryAdsDto } from '../../ads/dto/query-ads.dto';
import { ALLOWED_MEDIA_MIME_PATTERN, MAX_AD_MEDIAS } from '../../common/media/thumbnails';
import { assertHoneypotClear } from '../../common/honeypot';

@ApiTags('Admin Announces')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/announces')
export class AdminAnnouncesController {
  constructor(private readonly adsService: AdsService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List announces with filters and pagination (admin)' })
  index(@CurrentUser() user: any, @Query() query: QueryAdsDto) {
    this.ensureAdmin(user);
    return this.adsService.index(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announce details (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.adsService.show(id, user.id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new announce (admin)' })
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
        neighbourhood: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' },
        zip: { type: 'string' },
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
        const isAllowed = ALLOWED_MEDIA_MIME_PATTERN.test(file.mimetype);
        callback(isAllowed ? null : new Error('Only image and video medias are allowed.'), isAllowed);
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  create(@CurrentUser() user: any, @Body() body: any, @UploadedFiles() files: any[] = []) {
    this.ensureAdmin(user);
    assertHoneypotClear(body.website, 'admin.ads.create');
    return this.adsService.create(body, files, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an announce (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    this.ensureAdmin(user);
    return this.adsService.updateAd(id, body, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announce (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(@Param('id') id: string, @CurrentUser() user: any, @Res() res: any) {
    this.ensureAdmin(user);
    await this.adsService.destroyAdAsAdmin(id, user);
    return res.status(204).send();
  }
}
