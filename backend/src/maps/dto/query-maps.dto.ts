import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMapsListingsDto {
  @ApiPropertyOptional({ description: 'Bounding box west (min longitude)' })
  bbox_west?: string;

  @ApiPropertyOptional({ description: 'Bounding box south (min latitude)' })
  bbox_south?: string;

  @ApiPropertyOptional({ description: 'Bounding box east (max longitude)' })
  bbox_east?: string;

  @ApiPropertyOptional({ description: 'Bounding box north (max latitude)' })
  bbox_north?: string;

  @ApiPropertyOptional({ description: 'Zoom level' })
  zoom?: string;

  @ApiPropertyOptional({ description: 'City filter' })
  city?: string;

  @ApiPropertyOptional({ description: 'Property type (Chambre, Appartement, Maison, Meublé)' })
  item_type?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  price_min?: string;

  @ApiPropertyOptional({ description: 'Maximum price' })
  price_max?: string;

  @ApiPropertyOptional({ description: 'Ad type (location/sale)' })
  ad_type?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  page?: string;

  @ApiPropertyOptional({ description: 'Per page' })
  per_page?: string;
}

export class QueryMapsNearbyDto {
  @ApiPropertyOptional({ description: 'Latitude' })
  lat!: string;

  @ApiPropertyOptional({ description: 'Longitude' })
  lng!: string;

  @ApiPropertyOptional({ description: 'Radius in km' })
  radius?: string;
}
