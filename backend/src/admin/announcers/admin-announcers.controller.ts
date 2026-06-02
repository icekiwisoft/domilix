import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ObjectStorageService } from '../../common/object-storage/object-storage.service';
import { AnnouncersService } from '../../announcers/announcers.service';
import { QueryAnnouncersDto } from '../../announcers/dto/query-announcers.dto';
import { UpsertAnnouncerDto } from '../../announcers/dto/upsert-announcer.dto';

type AdminUser = {
  id: bigint;
  isAdmin?: boolean;
};

type AvatarUrlDto = {
  avatar_url?: string;
};

@ApiTags('Admin Announcers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/announcers')
export class AdminAnnouncersController {
  constructor(
    private readonly announcersService: AnnouncersService,
    private readonly objectStorage: ObjectStorageService,
  ) {}

  private ensureAdmin(user: AdminUser) {
    if (!user.isAdmin) throw new ForbiddenException('Admin access required');
  }

  private async uploadOptionalAvatar(
    file: Express.Multer.File | undefined,
    existingUrl?: string,
  ) {
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
  index(@CurrentUser() user: AdminUser, @Query() query: QueryAnnouncersDto) {
    this.ensureAdmin(user);
    return this.announcersService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcer details (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  show(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
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
  async create(
    @CurrentUser() user: AdminUser,
    @Body() dto: UpsertAnnouncerDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    this.ensureAdmin(user);
    return this.announcersService.create(
      user,
      dto,
      await this.uploadOptionalAvatar(avatar, (dto as AvatarUrlDto).avatar_url),
    );
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
  async update(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Body() dto: Partial<UpsertAnnouncerDto>,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    this.ensureAdmin(user);
    return this.announcersService.update(
      user,
      id,
      dto,
      await this.uploadOptionalAvatar(avatar, (dto as AvatarUrlDto).avatar_url),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcer (admin)' })
  @ApiParam({ name: 'id', example: 'announcer-uuid' })
  async destroy(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    this.ensureAdmin(user);
    await this.announcersService.destroy(user, id);
    return res.status(204).send();
  }
}
