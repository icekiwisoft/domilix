import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { AnnouncersService } from './announcers.service';
import { QueryAnnouncersDto } from './dto/query-announcers.dto';
import { UpsertAnnouncerDto } from './dto/upsert-announcer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const announcerImageDir = path.join(process.cwd(), 'storage', 'images');
fs.mkdirSync(announcerImageDir, { recursive: true });

@ApiTags('Announcers')
@Controller('announcers')
export class AnnouncersController {
  constructor(private readonly announcersService: AnnouncersService) {}

  @Get()
  @ApiOperation({ summary: 'List announcers' })
  index(@Query() query: QueryAnnouncersDto) {
    return this.announcersService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcer details' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  show(@Param('id') id: string) {
    return this.announcersService.show(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create an announcer (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        user_id: { type: 'string' },
        bio: { type: 'string' },
        contact: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: announcerImageDir,
        filename: (_req, file, callback) => {
          callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(@CurrentUser() user: any, @Body() dto: UpsertAnnouncerDto, @UploadedFile() avatar?: any) {
    return this.announcersService.create(user, dto, avatar ? `/storage/images/${avatar.filename}` : undefined);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an announcer (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        user_id: { type: 'string' },
        bio: { type: 'string' },
        contact: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: announcerImageDir,
        filename: (_req, file, callback) => {
          callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<UpsertAnnouncerDto>, @UploadedFile() avatar?: any) {
    return this.announcersService.update(user, id, dto, avatar ? `/storage/images/${avatar.filename}` : undefined);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcer (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  async destroy(@CurrentUser() user: any, @Param('id') id: string, @Res() res: any) {
    await this.announcersService.destroy(user, id);
    return res.status(204).send();
  }
}
