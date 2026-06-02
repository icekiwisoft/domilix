import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnnouncersService } from './announcers.service';
import { QueryAnnouncersDto } from './dto/query-announcers.dto';

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
}
