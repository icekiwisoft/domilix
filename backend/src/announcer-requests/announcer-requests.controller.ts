import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { AnnouncerRequestsService } from './announcer-requests.service';
import { UpdateAnnouncerRequestDto } from './dto/update-announcer-request.dto';

@ApiTags('Announcer Requests')
@Controller('announcer-requests')
export class AnnouncerRequestsController {
  constructor(
    private readonly announcerRequestsService: AnnouncerRequestsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List announcer requests' })
  index() {
    return this.announcerRequestsService.index();
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create announcer request for current user' })
  store(@CurrentUser() user: any) {
    return this.announcerRequestsService.store(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcer request by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@Param('id') id: string) {
    return this.announcerRequestsService.show(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update announcer request status' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncerRequestDto) {
    return this.announcerRequestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete announcer request' })
  @ApiParam({ name: 'id', example: '1' })
  destroy(@Param('id') id: string) {
    return this.announcerRequestsService.destroy(id);
  }
}
