import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryMapsListingsDto {
  @ApiPropertyOptional({ description: 'Bounding box west (min longitude)' })
  @IsOptional()
  @IsString()
  bbox_west?: string;

  @ApiPropertyOptional({ description: 'Bounding box south (min latitude)' })
  @IsOptional()
  @IsString()
  bbox_south?: string;

  @ApiPropertyOptional({ description: 'Bounding box east (max longitude)' })
  @IsOptional()
  @IsString()
  bbox_east?: string;

  @ApiPropertyOptional({ description: 'Bounding box north (max latitude)' })
  @IsOptional()
  @IsString()
  bbox_north?: string;

  @ApiPropertyOptional({ description: 'Zoom level' })
  @IsOptional()
  @IsString()
  zoom?: string;

  @ApiPropertyOptional({ description: 'City filter' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Property type (Chambre, Appartement, Maison, Meublé)' })
  @IsOptional()
  @IsString()
  item_type?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsString()
  price_min?: string;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsString()
  price_max?: string;

  @ApiPropertyOptional({ description: 'Ad type (location/sale)' })
  @IsOptional()
  @IsString()
  ad_type?: string;

  @ApiPropertyOptional({ description: 'Filter by user likes (1 = only liked)' })
  @IsOptional()
  @IsString()
  is_liked?: string;

  @ApiPropertyOptional({ description: 'Filter by unlocked announces (1 = only unlocked)' })
  @IsOptional()
  @IsString()
  is_unlocked?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ description: 'Per page' })
  @IsOptional()
  @IsString()
  per_page?: string;
}

export class QueryMapsNearbyDto {
  @ApiPropertyOptional({ description: 'Latitude' })
  @IsString()
  lat!: string;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsString()
  lng!: string;

  @ApiPropertyOptional({ description: 'Radius in km' })
  @IsOptional()
  @IsString()
  radius?: string;
}
