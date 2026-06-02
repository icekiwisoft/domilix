import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AnnouncerRequestsService } from '../../announcer-requests/announcer-requests.service';
import { UpdateAnnouncerRequestDto } from '../../announcer-requests/dto/update-announcer-request.dto';

@ApiTags('Admin Announcer Requests')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/announcer-requests')
export class AdminAnnouncerRequestsController {
  constructor(
    private readonly announcerRequestsService: AnnouncerRequestsService,
  ) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List announcer requests (admin)' })
  index(@CurrentUser() user: any) {
    this.ensureAdmin(user);
    return this.announcerRequestsService.index();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcer request by id (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.announcerRequestsService.show(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update announcer request status (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncerRequestDto,
  ) {
    this.ensureAdmin(user);
    return this.announcerRequestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete announcer request (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  destroy(@CurrentUser() user: any, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.announcerRequestsService.destroy(id);
  }
}
