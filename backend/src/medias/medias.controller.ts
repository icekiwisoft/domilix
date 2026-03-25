import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { MediasService } from './medias.service';

const mediaUploadDir = path.join(process.cwd(), 'storage', 'medias');
fs.mkdirSync(mediaUploadDir, { recursive: true });

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
  @ApiOperation({ summary: 'Upload medias and optionally attach them to an announce' })
  @UseInterceptors(
    FilesInterceptor('medias', 10, {
      storage: diskStorage({
        destination: mediaUploadDir,
        filename: (_req, file, callback) => {
          callback(null, `${Date.now()}---${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
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
    return this.mediasService.store(
      user,
      { AdId: body.AdId, filesid },
      files.map((file) => ({ filename: file.filename, mimetype: file.mimetype })),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media or detach it from an announce' })
  @ApiParam({ name: 'id', example: 'media-uuid' })
  @ApiQuery({ name: 'AdId', required: false })
  destroy(@Param('id') id: string, @Query('AdId') adId?: string) {
    return this.mediasService.destroy(id, adId);
  }
}

@ApiTags('Announcer Medias')
@Controller('announcers/:announcerId/medias')
export class AnnouncerMediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Get()
  @ApiOperation({ summary: 'List medias for a specific announcer' })
  @ApiParam({ name: 'announcerId', example: 'announcer-uuid' })
  index(@Param('announcerId') announcerId: string, @Query('page') page?: string) {
    return this.mediasService.indexByAnnouncer(announcerId, Number(page || 1));
  }
}
