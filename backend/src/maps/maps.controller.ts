import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { QueryMapsListingsDto, QueryMapsNearbyDto } from './dto/query-maps.dto';

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('listings')
  @ApiOperation({ summary: 'Get map listings with optional bbox filter' })
  async listings(@Query() query: QueryMapsListingsDto) {
    return this.mapsService.listings(query);
  }

  @Get('listings/nearby')
  @ApiOperation({ summary: 'Get listings near coordinates' })
  async nearby(@Query() query: QueryMapsNearbyDto) {
    return this.mapsService.nearby(query);
  }
}
