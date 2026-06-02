import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ObjectStorageService } from '../../common/object-storage/object-storage.service';
import { AnnouncersService } from '../../announcers/announcers.service';
import { QueryAnnouncersDto } from '../../announcers/dto/query-announcers.dto';
import { UpsertAnnouncerDto } from '../../announcers/dto/upsert-announcer.dto';

@ApiTags('Admin Announcers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/announcers')
export class AdminAnnouncersController {
  constructor(
    private readonly announcersService: AnnouncersService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  private async uploadOptionalAvatar(file: any | undefined, existingUrl?: string) {
    if (existingUrl) return existingUrl;
    if (!file) return undefined;

    try {
      return (await this.objectStorage.uploadFile(file, 'announcers')).url;
    } catch {
      throw new InternalServerErrorException('Impossible d uploader l avatar.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List announcers (admin)' })
  index(@Query() query: QueryAnnouncersDto) {
    return this.announcersService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcer details (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  show(@Param('id') id: string) {
    return this.announcersService.show(id);
  }

  @Post()
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
      storage: memoryStorage(),
    }),
  )
  async create(@CurrentUser() user: any, @Body() dto: UpsertAnnouncerDto, @UploadedFile() avatar?: any) {
    return this.announcersService.create(user, dto, await this.uploadOptionalAvatar(avatar, (dto as any).avatar_url));
  }

  @Put(':id')
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
      storage: memoryStorage(),
    }),
  )
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<UpsertAnnouncerDto>, @UploadedFile() avatar?: any) {
    return this.announcersService.update(user, id, dto, await this.uploadOptionalAvatar(avatar, (dto as any).avatar_url));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcer (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  async destroy(@CurrentUser() user: any, @Param('id') id: string, @Res() res: any) {
    await this.announcersService.destroy(user, id);
    return res.status(204).send();
  }
}
