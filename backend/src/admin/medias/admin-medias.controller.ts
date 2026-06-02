import { Controller, Delete, ForbiddenException, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { MediasService } from '../../medias/medias.service';

@ApiTags('Admin Medias')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/medias')
export class AdminMediasController {
  constructor(private readonly mediasService: MediasService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List medias filtered by announce or announcer (admin)' })
  @ApiQuery({ name: 'AnnounceId', required: false })
  @ApiQuery({ name: 'AnnouncerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  index(
    @CurrentUser() user: any,
    @Query('AnnounceId') AnnounceId?: string,
    @Query('AnnouncerId') AnnouncerId?: string,
    @Query('page') page?: string,
  ) {
    this.ensureAdmin(user);
    return this.mediasService.index({ AnnounceId, AnnouncerId, page });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by id (admin)' })
  @ApiParam({ name: 'id', example: 'media-uuid' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.mediasService.show(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media or detach it from an announce (admin)' })
  @ApiParam({ name: 'id', example: 'media-uuid' })
  @ApiQuery({ name: 'AdId', required: false })
  destroy(@CurrentUser() user: any, @Param('id') id: string, @Query('AdId') adId?: string) {
    this.ensureAdmin(user);
    return this.mediasService.destroy(id, adId);
  }
}
