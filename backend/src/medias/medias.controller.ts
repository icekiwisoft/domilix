import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { MediasService } from './medias.service';
import {
  ALLOWED_MEDIA_MIME_PATTERN,
  MAX_AD_MEDIAS,
} from '../common/media/thumbnails';

@ApiTags('Medias')
@Controller('medias')
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Get()
  @ApiOperation({ summary: 'List medias filtered by announce or announcer' })
  @ApiQuery({ name: 'AnnounceId', required: false })
  @ApiQuery({ name: 'AnnouncerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  index(
    @Query('AnnounceId') AnnounceId?: string,
    @Query('AnnouncerId') AnnouncerId?: string,
    @Query('page') page?: string,
  ) {
    return this.mediasService.index({ AnnounceId, AnnouncerId, page });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by id' })
  @ApiParam({ name: 'id', example: 'media-uuid' })
  show(@Param('id') id: string) {
    return this.mediasService.show(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload medias and optionally attach them to an announce',
  })
  @UseInterceptors(
    FilesInterceptor('medias', MAX_AD_MEDIAS, {
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
  store(
    @CurrentUser() user: any,
    @Body() body: any,
    @UploadedFiles() files: any[] = [],
  ) {
    const filesid = Array.isArray(body.filesid)
      ? body.filesid
      : body.filesid
        ? [body.filesid]
        : [];
    const mediaIds = [body.media_ids, body['media_ids[]']]
      .flat()
      .filter(Boolean);
    const mediaUrls = [body.media_urls, body['media_urls[]']]
      .flat()
      .filter(Boolean);
    const mediaThumbnails = [body.media_thumbnails, body['media_thumbnails[]']]
      .flat()
      .filter(Boolean);
    const mediaTypes = [body.media_types, body['media_types[]']]
      .flat()
      .filter(Boolean);
    const mediaBuckets = [body.media_buckets, body['media_buckets[]']]
      .flat()
      .filter(Boolean);
    const mediaOriginalPaths = [
      body.media_original_paths,
      body['media_original_paths[]'],
    ]
      .flat()
      .filter(Boolean);
    const mediaThumbnailPaths = [
      body.media_thumbnail_paths,
      body['media_thumbnail_paths[]'],
    ]
      .flat()
      .filter(Boolean);
    return this.mediasService.store(
      user,
      {
        AdId: body.AdId,
        filesid,
        media_ids: mediaIds,
        media_urls: mediaUrls,
        media_thumbnails: mediaThumbnails,
        media_types: mediaTypes,
        media_buckets: mediaBuckets,
        media_original_paths: mediaOriginalPaths,
        media_thumbnail_paths: mediaThumbnailPaths,
      },
      files,
    );
  }
}

@ApiTags('Announcer Medias')
@Controller('announcers/:announcerId/medias')
export class AnnouncerMediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Get()
  @ApiOperation({ summary: 'List medias for a specific announcer' })
  @ApiParam({ name: 'announcerId', example: 'announcer-uuid' })
  index(
    @Param('announcerId') announcerId: string,
    @Query('page') page?: string,
  ) {
    return this.mediasService.indexByAnnouncer(announcerId, Number(page || 1));
  }
}
