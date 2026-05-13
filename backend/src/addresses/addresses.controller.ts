import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { SearchAddressesDto } from './dto/search-addresses.dto';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search addresses with Mapbox geocoding' })
  @ApiOkResponse({ description: 'Address suggestions' })
  search(@Query() dto: SearchAddressesDto) {
    return this.addressesService.search(dto);
  }

  @Get('reverse-geocode')
  @ApiOperation({ summary: 'Resolve address from coordinates' })
  async reverseGeocode(@Query() dto: ReverseGeocodeDto) {
    const result = await this.addressesService.reverseGeocode(dto);
    if (!result.success) {
      return { ...result, data: null };
    }
    return result;
  }
}
