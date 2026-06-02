import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { AnnouncerRequestsService } from './announcer-requests.service';

@ApiTags('Announcer Requests')
@Controller('announcer-requests')
export class AnnouncerRequestsController {
  constructor(
    private readonly announcerRequestsService: AnnouncerRequestsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create announcer request for current user' })
  store(@CurrentUser() user: any) {
    return this.announcerRequestsService.store(user.id);
  }
}
